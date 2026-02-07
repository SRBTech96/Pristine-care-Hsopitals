import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string; // Format: INV-YYYY-MMMM-XXXXX

  @Column({ type: 'uuid', nullable: true })
  patientId: string; // NULL for non-patient invoices (e.g., staff)

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string; // Reference to appointment

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number; // Sum of line items before tax/discount

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number; // GST/Tax amount

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number; // From discount approvals

  @Column({ type: 'uuid', nullable: true })
  discountApprovalId: string; // Reference to discount_approvals table

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number; // subtotal + tax - discount

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number; // Running total of payments

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceDue: number; // totalAmount - paidAmount

  @Column({ enum: ['draft', 'issued', 'partially_paid', 'fully_paid', 'overdue', 'cancelled'], default: 'draft' })
  status: string;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ text: true, nullable: true })
  notes: string; // Additional notes/terms

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
