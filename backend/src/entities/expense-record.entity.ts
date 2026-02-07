import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'finance_expense_records' })
export class ExpenseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expense_number', length: 50, unique: true })
  expenseNumber: string;

  @Column({ length: 100 })
  category: string; // salaries, supplies, maintenance, utilities, other

  @Column({ length: 200, nullable: true })
  vendor?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ name: 'payment_method', length: 20 })
  paymentMethod: string; // cash, bank, upi, card

  @Column({ name: 'payment_reference', type: 'text', nullable: true })
  paymentReference?: string;

  @Column({ name: 'expense_date', type: 'date', default: () => 'CURRENT_DATE' })
  expenseDate: Date;

  @Column({ length: 20, default: 'recorded' })
  status: string; // recorded, approved, paid

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;
}
