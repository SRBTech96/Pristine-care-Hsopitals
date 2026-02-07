import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueRecord } from '../entities/revenue-record.entity';
import { ExpenseRecord } from '../entities/expense-record.entity';
import { CreateRevenueDto } from './dto/revenue.dto';
import { CreateExpenseDto } from './dto/expense.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(RevenueRecord)
    private revenueRepo: Repository<RevenueRecord>,
    @InjectRepository(ExpenseRecord)
    private expenseRepo: Repository<ExpenseRecord>,
    private auditService: AuditService,
  ) {}

  // Create revenue record
  async createRevenue(dto: CreateRevenueDto, userId: string): Promise<RevenueRecord> {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Amount must be provided and > 0');
    }

    const receiptNumber = `RCPT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const finalAmount = Number((dto.amount - (dto.discountAmount || 0)).toFixed(2));

    const rev = this.revenueRepo.create({
      receiptNumber,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      doctorId: dto.doctorId,
      departmentId: dto.departmentId,
      amount: dto.amount,
      discountAmount: dto.discountAmount || 0,
      finalAmount,
      discountApprovalId: dto.discountApprovalId,
      paymentMethod: dto.paymentMethod,
      paymentReference: dto.paymentReference,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
      status: 'collected',
      notes: dto.notes,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.revenueRepo.save(rev);
    await this.auditService.logAccess({ action: 'FINANCE_CREATE_REVENUE', resourceType: 'RevenueRecord', resourceId: saved.id, userId, details: { receiptNumber: saved.receiptNumber, amount: saved.finalAmount } });
    return saved;
  }

  async getRevenue(id: string): Promise<RevenueRecord> {
    const r = await this.revenueRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Revenue record not found');
    return r;
  }

  async listRevenue(filter: { doctorId?: string; departmentId?: string; from?: string; to?: string } = {}): Promise<RevenueRecord[]> {
    const qb = this.revenueRepo.createQueryBuilder('r');
    if (filter.doctorId) qb.andWhere('r.doctorId = :doctorId', { doctorId: filter.doctorId });
    if (filter.departmentId) qb.andWhere('r.departmentId = :departmentId', { departmentId: filter.departmentId });
    if (filter.from) qb.andWhere('r.paymentDate >= :from', { from: new Date(filter.from) });
    if (filter.to) qb.andWhere('r.paymentDate <= :to', { to: new Date(filter.to) });
    qb.orderBy('r.paymentDate', 'DESC');
    return qb.getMany();
  }

  // Aggregations
  async aggregateRevenueByDoctor(from?: string, to?: string) {
    const qb = this.revenueRepo.createQueryBuilder('r')
      .select('r.doctorId', 'doctorId')
      .addSelect('SUM(r.finalAmount)', 'total')
      .where('r.status = :status', { status: 'collected' })
      .groupBy('r.doctorId');

    if (from) qb.andWhere('r.paymentDate >= :from', { from: new Date(from) });
    if (to) qb.andWhere('r.paymentDate <= :to', { to: new Date(to) });

    return qb.getRawMany();
  }

  async aggregateRevenueByDepartment(from?: string, to?: string) {
    const qb = this.revenueRepo.createQueryBuilder('r')
      .select('r.departmentId', 'departmentId')
      .addSelect('SUM(r.finalAmount)', 'total')
      .where('r.status = :status', { status: 'collected' })
      .groupBy('r.departmentId');

    if (from) qb.andWhere('r.paymentDate >= :from', { from: new Date(from) });
    if (to) qb.andWhere('r.paymentDate <= :to', { to: new Date(to) });

    return qb.getRawMany();
  }

  // Expenses
  async createExpense(dto: CreateExpenseDto, userId: string): Promise<ExpenseRecord> {
    if (!dto.amount || dto.amount <= 0) throw new BadRequestException('Amount must be > 0');
    const expenseNumber = `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const exp = this.expenseRepo.create({
      expenseNumber,
      category: dto.category,
      vendor: dto.vendor,
      amount: dto.amount,
      departmentId: dto.departmentId,
      paymentMethod: dto.paymentMethod,
      paymentReference: dto.paymentReference,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
      status: 'recorded',
      notes: dto.notes,
      createdBy: userId,
      approvedBy: null,
    });

    const saved = await this.expenseRepo.save(exp);
    await this.auditService.logAccess({ action: 'FINANCE_CREATE_EXPENSE', resourceType: 'ExpenseRecord', resourceId: saved.id, userId, details: { expenseNumber: saved.expenseNumber, amount: saved.amount } });
    return saved;
  }

  async listExpenses(filter: { departmentId?: string; from?: string; to?: string } = {}): Promise<ExpenseRecord[]> {
    const qb = this.expenseRepo.createQueryBuilder('e');
    if (filter.departmentId) qb.andWhere('e.departmentId = :departmentId', { departmentId: filter.departmentId });
    if (filter.from) qb.andWhere('e.expenseDate >= :from', { from: new Date(filter.from) });
    if (filter.to) qb.andWhere('e.expenseDate <= :to', { to: new Date(filter.to) });
    qb.orderBy('e.expenseDate', 'DESC');
    return qb.getMany();
  }

  // Summary: cash vs bank balances (simple sums)
  async getBalances() {
    const cashInQ = this.revenueRepo.createQueryBuilder('r')
      .select('SUM(r.finalAmount)', 'total')
      .where('r.paymentMethod = :m', { m: 'cash' })
      .andWhere('r.status = :s', { s: 'collected' });
    const bankInQ = this.revenueRepo.createQueryBuilder('r')
      .select('SUM(r.finalAmount)', 'total')
      .where('r.paymentMethod IN (:...ms)', { ms: ['bank', 'upi', 'card'] })
      .andWhere('r.status = :s', { s: 'collected' });

    const cashOutQ = this.expenseRepo.createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.paymentMethod = :m', { m: 'cash' });
    const bankOutQ = this.expenseRepo.createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.paymentMethod IN (:...ms)', { ms: ['bank', 'upi', 'card'] });

    const [cashInRes, bankInRes, cashOutRes, bankOutRes] = await Promise.all([
      cashInQ.getRawOne(),
      bankInQ.getRawOne(),
      cashOutQ.getRawOne(),
      bankOutQ.getRawOne(),
    ]);

    const cashIn = Number(cashInRes?.total || 0);
    const bankIn = Number(bankInRes?.total || 0);
    const cashOut = Number(cashOutRes?.total || 0);
    const bankOut = Number(bankOutRes?.total || 0);

    return {
      cashBalance: cashIn - cashOut,
      bankBalance: bankIn - bankOut,
      cashIn,
      bankIn,
      cashOut,
      bankOut,
    };
  }
}
