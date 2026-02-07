import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'finance_revenue_records' })
export class RevenueRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_number', length: 50, unique: true })
  receiptNumber: string;

  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId?: string;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId?: string;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId?: string;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 12, scale: 2 })
  finalAmount: number;

  @Column({ name: 'discount_approval_id', type: 'uuid', nullable: true })
  discountApprovalId?: string;

  @Column({ name: 'payment_method', length: 20 })
  paymentMethod: string; // cash, bank, upi, card

  @Column({ name: 'payment_reference', type: 'text', nullable: true })
  paymentReference?: string;

  @Column({ name: 'payment_date', type: 'timestamptz', default: () => 'NOW()' })
  paymentDate: Date;

  @Column({ length: 20, default: 'collected' })
  status: string; // collected, pending, refunded

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
