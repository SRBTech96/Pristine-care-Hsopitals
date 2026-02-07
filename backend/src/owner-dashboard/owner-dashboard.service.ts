import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueRecord } from '../entities/revenue-record.entity';
import { ExpenseRecord } from '../entities/expense-record.entity';
import { PharmacySale } from '../entities/pharmacy-sale.entity';

@Injectable()
export class OwnerDashboardService {
  constructor(
    @InjectRepository(RevenueRecord)
    private revenueRepo: Repository<RevenueRecord>,
    @InjectRepository(ExpenseRecord)
    private expenseRepo: Repository<ExpenseRecord>,
    @InjectRepository(PharmacySale)
    private saleRepo: Repository<PharmacySale>,
  ) {}

  private toDateRange(from?: string, to?: string) {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    return { start, end };
  }

  async dailyRevenue(date?: string) {
    const day = date ? new Date(date) : new Date();
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const res = await this.revenueRepo.createQueryBuilder('r')
      .select('SUM(r.finalAmount)', 'total')
      .where('r.paymentDate >= :start AND r.paymentDate <= :end', { start, end })
      .andWhere('r.status = :s', { s: 'collected' })
      .getRawOne();

    return { date: start.toISOString().slice(0,10), total: Number(res?.total || 0) };
  }

  async monthlyRevenue(monthYear?: string) {
    const ref = monthYear ? new Date(monthYear) : new Date();
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);

    const res = await this.revenueRepo.createQueryBuilder('r')
      .select('SUM(r.finalAmount)', 'total')
      .where('r.paymentDate >= :start AND r.paymentDate <= :end', { start, end })
      .andWhere('r.status = :s', { s: 'collected' })
      .getRawOne();

    return { month: start.toISOString().slice(0,7), total: Number(res?.total || 0) };
  }

  async revenueByDoctor(from?: string, to?: string) {
    const { start, end } = this.toDateRange(from, to);
    const qb = this.revenueRepo.createQueryBuilder('r')
      .select('r.doctorId', 'doctorId')
      .addSelect('SUM(r.finalAmount)', 'total')
      .where('r.status = :s', { s: 'collected' })
      .groupBy('r.doctorId')
      .orderBy('total', 'DESC');

    if (start) qb.andWhere('r.paymentDate >= :start', { start });
    if (end) qb.andWhere('r.paymentDate <= :end', { end });

    return qb.getRawMany();
  }

  async revenueByDepartment(from?: string, to?: string) {
    const { start, end } = this.toDateRange(from, to);
    const qb = this.revenueRepo.createQueryBuilder('r')
      .select('r.departmentId', 'departmentId')
      .addSelect('SUM(r.finalAmount)', 'total')
      .where('r.status = :s', { s: 'collected' })
      .groupBy('r.departmentId')
      .orderBy('total', 'DESC');

    if (start) qb.andWhere('r.paymentDate >= :start', { start });
    if (end) qb.andWhere('r.paymentDate <= :end', { end });

    return qb.getRawMany();
  }

  async expensesSummary(from?: string, to?: string) {
    const { start, end } = this.toDateRange(from, to);
    const qb = this.expenseRepo.createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .groupBy('e.category')
      .orderBy('total', 'DESC');

    if (start) qb.where('e.expenseDate >= :start', { start });
    if (end) qb.andWhere('e.expenseDate <= :end', { end });

    const perCategory = await qb.getRawMany();

    const totalRes = await this.expenseRepo.createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .getRawOne();

    return { total: Number(totalRes?.total || 0), perCategory };
  }

  async pharmacyRevenue(from?: string, to?: string) {
    const { start, end } = this.toDateRange(from, to);
    const qb = this.saleRepo.createQueryBuilder('s')
      .select('SUM(s.finalAmount)', 'total')
      .where('1=1');

    if (start) qb.andWhere('s.saleDate >= :start', { start });
    if (end) qb.andWhere('s.saleDate <= :end', { end });

    const res = await qb.getRawOne();
    return { total: Number(res?.total || 0) };
  }

  async discountsSummary(from?: string, to?: string) {
    const { start, end } = this.toDateRange(from, to);
    // sum discounts from revenue records
    const revQ = this.revenueRepo.createQueryBuilder('r')
      .select('SUM(r.discountAmount)', 'total')
      .where('1=1');
    if (start) revQ.andWhere('r.paymentDate >= :start', { start });
    if (end) revQ.andWhere('r.paymentDate <= :end', { end });

    const saleQ = this.saleRepo.createQueryBuilder('s')
      .select('SUM(s.discountAmount)', 'total')
      .where('1=1');
    if (start) saleQ.andWhere('s.saleDate >= :start', { start });
    if (end) saleQ.andWhere('s.saleDate <= :end', { end });

    const [revRes, saleRes] = await Promise.all([revQ.getRawOne(), saleQ.getRawOne()]);
    const revTotal = Number(revRes?.total || 0);
    const saleTotal = Number(saleRes?.total || 0);

    return { totalDiscount: revTotal + saleTotal, revenueDiscount: revTotal, pharmacyDiscount: saleTotal };
  }
}
