import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HrEmployee } from '../entities/hr-employee.entity';
import { SalaryStructure } from '../entities/salary-structure.entity';
import { PayrollRecord } from '../entities/payroll-record.entity';
import { HrLeaveRecord } from '../entities/hr-leave-record.entity';
import { HrOfferLetter } from '../entities/hr-offer-letter.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { CreateSalaryStructureDto } from './dto/salary-structure.dto';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';
import { CreateLeaveDto, UpdateLeaveDto } from './dto/leave.dto';
import { CreateOfferLetterDto } from './dto/offer-letter.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(HrEmployee)
    private employeeRepository: Repository<HrEmployee>,
    @InjectRepository(SalaryStructure)
    private salaryStructureRepository: Repository<SalaryStructure>,
    @InjectRepository(PayrollRecord)
    private payrollRepository: Repository<PayrollRecord>,
    @InjectRepository(HrLeaveRecord)
    private leaveRepository: Repository<HrLeaveRecord>,
    @InjectRepository(HrOfferLetter)
    private offerLetterRepository: Repository<HrOfferLetter>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  // ===== EMPLOYEE MANAGEMENT =====

  async createEmployee(dto: CreateEmployeeDto, userId: string): Promise<HrEmployee> {
    const employee = this.employeeRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.employeeRepository.save(employee);
  }

  async getEmployee(employeeId: string): Promise<HrEmployee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }
    return employee;
  }

  async listEmployeesByDepartment(departmentId: string): Promise<HrEmployee[]> {
    return this.employeeRepository.find({
      where: { departmentId, status: 'active' },
    });
  }

  async listAllEmployees(): Promise<HrEmployee[]> {
    return this.employeeRepository.find({});
  }

  async updateEmployee(
    employeeId: string,
    dto: UpdateEmployeeDto,
    userId: string,
  ): Promise<HrEmployee> {
    const employee = await this.getEmployee(employeeId);
    this.employeeRepository.merge(employee, { ...dto, updatedBy: userId });
    return this.employeeRepository.save(employee);
  }

  // ===== SALARY STRUCTURE MANAGEMENT =====

  async createSalaryStructure(
    dto: CreateSalaryStructureDto,
    userId: string,
  ): Promise<SalaryStructure> {
    const employee = await this.getEmployee(dto.employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Employee ${dto.employeeId} not found`,
      );
    }

    const salary = this.salaryStructureRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.salaryStructureRepository.save(salary);
  }

  async getActiveSalaryStructure(employeeId: string): Promise<SalaryStructure> {
    const today = new Date();
    const salary = await this.salaryStructureRepository.findOne({
      where: {
        employeeId,
        isActive: true,
      },
    });
    if (!salary) {
      throw new NotFoundException(
        `No active salary structure found for employee ${employeeId}`,
      );
    }
    return salary;
  }

  async listSalaryStructures(employeeId: string): Promise<SalaryStructure[]> {
    return this.salaryStructureRepository.find({
      where: { employeeId },
      order: { effectiveFrom: 'DESC' },
    });
  }

  // ===== PAYROLL PROCESSING =====

  async processPayroll(
    employeeId: string,
    dto: CreatePayrollDto,
    userId: string,
  ): Promise<PayrollRecord> {
    const employee = await this.getEmployee(employeeId);
    const salaryStructure = await this.getActiveSalaryStructure(employeeId);

    // Check if payroll already processed for this month
    const monthYear = new Date(dto.monthYear);
    monthYear.setDate(1);
    const existing = await this.payrollRepository.findOne({
      where: { employeeId, monthYear },
    });
    if (existing && existing.status !== 'failed') {
      throw new BadRequestException(
        `Payroll already processed for employee ${employeeId} in ${monthYear.toISOString().split('T')[0]}`,
      );
    }

    // Calculate net salary
    const leaveDeduction = dto.unpaidLeaveDays * (salaryStructure.baseSalary / 30);
    const netSalary =
      salaryStructure.grossSalary -
      (dto.deductions || 0) -
      leaveDeduction +
      (dto.bonusAmount || 0);

    const payroll = this.payrollRepository.create({
      employeeId,
      monthYear,
      baseSalary: salaryStructure.baseSalary,
      allowances: salaryStructure.allowances,
      deductions: dto.deductions || 0,
      grossSalary: salaryStructure.grossSalary,
      netSalary: Math.max(0, netSalary),
      unpaidLeaveDays: dto.unpaidLeaveDays || 0,
      leaveDeduction,
      bonusAmount: dto.bonusAmount || 0,
      status: 'pending',
      createdBy: userId,
    });

    return this.payrollRepository.save(payroll);
  }

  async approvePayroll(payrollId: string, userId: string): Promise<PayrollRecord> {
    const payroll = await this.payrollRepository.findOne({
      where: { id: payrollId },
    });
    if (!payroll) {
      throw new NotFoundException(`Payroll record ${payrollId} not found`);
    }
    if (payroll.status !== 'pending') {
      throw new BadRequestException(`Payroll already ${payroll.status}`);
    }

    payroll.status = 'processed';
    payroll.processedBy = userId;
    return this.payrollRepository.save(payroll);
  }

  async markPayrollAsPaid(
    payrollId: string,
    paymentReference: string,
    userId: string,
  ): Promise<PayrollRecord> {
    const payroll = await this.payrollRepository.findOne({
      where: { id: payrollId },
    });
    if (!payroll) {
      throw new NotFoundException(`Payroll record ${payrollId} not found`);
    }

    payroll.status = 'paid';
    payroll.paymentDate = new Date();
    payroll.paymentReference = paymentReference;
    payroll.approvedBy = userId;
    return this.payrollRepository.save(payroll);
  }

  async getPayrollHistory(
    employeeId: string,
    limit: number = 12,
  ): Promise<PayrollRecord[]> {
    return this.payrollRepository.find({
      where: { employeeId },
      order: { monthYear: 'DESC' },
      take: limit,
    });
  }

  // ===== LEAVE MANAGEMENT =====

  async createLeaveRequest(
    dto: CreateLeaveDto,
    userId: string,
  ): Promise<HrLeaveRecord> {
    const employee = await this.getEmployee(dto.employeeId);
    if (employee.status === 'terminated') {
      throw new BadRequestException('Cannot create leave for terminated employee');
    }

    const leave = this.leaveRepository.create({
      ...dto,
      status: 'pending',
      createdBy: userId,
    });
    return this.leaveRepository.save(leave);
  }

  async approveLeave(
    leaveId: string,
    approvalComments: string,
    userId: string,
  ): Promise<HrLeaveRecord> {
    const leave = await this.leaveRepository.findOne({
      where: { id: leaveId },
    });
    if (!leave) {
      throw new NotFoundException(`Leave record ${leaveId} not found`);
    }
    if (leave.status !== 'pending') {
      throw new BadRequestException(`Leave already ${leave.status}`);
    }

    leave.status = 'approved';
    leave.approvedBy = userId;
    leave.approvalDate = new Date();
    leave.approvalComments = approvalComments;
    return this.leaveRepository.save(leave);
  }

  async rejectLeave(
    leaveId: string,
    rejectionReason: string,
    userId: string,
  ): Promise<HrLeaveRecord> {
    const leave = await this.leaveRepository.findOne({
      where: { id: leaveId },
    });
    if (!leave) {
      throw new NotFoundException(`Leave record ${leaveId} not found`);
    }
    if (leave.status !== 'pending') {
      throw new BadRequestException(`Leave already ${leave.status}`);
    }

    leave.status = 'rejected';
    leave.approvedBy = userId;
    leave.approvalDate = new Date();
    leave.approvalComments = rejectionReason;
    return this.leaveRepository.save(leave);
  }

  async getLeaveBalance(
    employeeId: string,
    year: number,
  ): Promise<{
    [leaveType: string]: { used: number; remaining: number };
  }> {
    const leaveRecords = await this.leaveRepository.find({
      where: { employeeId, status: 'approved' },
    });

    // Filter by year
    const yearLeaves = leaveRecords.filter(
      (l) => l.startDate.getFullYear() === year,
    );

    // Define leave limits per type (customizable per hospital)
    const leaveLimits = {
      sick: 12,
      casual: 10,
      earned: 20,
      maternity: 180,
      unpaid: Infinity,
    };

    const balance = {};
    for (const [leaveType, limit] of Object.entries(leaveLimits)) {
      const used = yearLeaves
        .filter((l) => l.leaveType === leaveType)
        .reduce((sum, l) => sum + l.numberOfDays, 0);
      balance[leaveType] = {
        used,
        remaining: limit === Infinity ? Infinity : Math.max(0, limit - used),
      };
    }

    return balance;
  }

  async getApprovedLeavesForRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HrLeaveRecord[]> {
    return this.leaveRepository.find({
      where: {
        employeeId,
        status: 'approved',
      },
    });
  }

  // ===== OFFER LETTER MANAGEMENT =====

  async createOfferLetter(
    dto: CreateOfferLetterDto,
    userId: string,
  ): Promise<HrOfferLetter> {
    const employee = await this.getEmployee(dto.employeeId);

    const offer = this.offerLetterRepository.create({
      ...dto,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    });
    return this.offerLetterRepository.save(offer);
  }

  async getOfferLetter(offerId: string): Promise<HrOfferLetter> {
    const offer = await this.offerLetterRepository.findOne({
      where: { id: offerId },
    });
    if (!offer) {
      throw new NotFoundException(`Offer letter ${offerId} not found`);
    }
    return offer;
  }

  async updateOfferLetterStatus(
    offerId: string,
    status: string,
    userId: string,
  ): Promise<HrOfferLetter> {
    const offer = await this.getOfferLetter(offerId);
    const validStatuses = [
      'draft',
      'sent',
      'accepted',
      'rejected',
      'signed',
      'expired',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    offer.status = status;
    offer.updatedBy = userId;

    if (status === 'accepted') {
      offer.acceptanceDate = new Date();
    }
    if (status === 'signed') {
      offer.signingDate = new Date();
    }

    return this.offerLetterRepository.save(offer);
  }

  async listOfferLetters(employeeId: string): Promise<HrOfferLetter[]> {
    return this.offerLetterRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }
}
