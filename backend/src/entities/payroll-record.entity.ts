import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payroll_records' })
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @Column({ name: 'month_year', type: 'date' })
  monthYear!: Date; // First day of month

  @Column({ name: 'base_salary', type: 'decimal', precision: 12, scale: 2 })
  baseSalary!: number;

  @Column({ name: 'allowances', type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowances!: number;

  @Column({ name: 'deductions', type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductions!: number;

  @Column({ name: 'gross_salary', type: 'decimal', precision: 12, scale: 2 })
  grossSalary!: number;

  @Column({ name: 'net_salary', type: 'decimal', precision: 12, scale: 2 })
  netSalary!: number; // gross - deductions

  // Leave adjustments
  @Column({ name: 'unpaid_leave_days', type: 'int', default: 0 })
  unpaidLeaveDays!: number;

  @Column({ name: 'leave_deduction', type: 'decimal', precision: 12, scale: 2, default: 0 })
  leaveDeduction!: number;

  // Bonuses/Incentives
  @Column({ name: 'bonus_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  bonusAmount?: number;

  @Column({ name: 'bonus_reason', length: 255, nullable: true })
  bonusReason?: string;

  // Status workflow
  @Column({ length: 50, default: 'pending' })
  status!: string; // pending, processed, paid, failed

  @Column({ name: 'payment_date', type: 'timestamptz', nullable: true })
  paymentDate?: Date;

  @Column({ name: 'payment_reference', length: 100, nullable: true })
  paymentReference?: string; // Bank transfer ID

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy?: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;
}
