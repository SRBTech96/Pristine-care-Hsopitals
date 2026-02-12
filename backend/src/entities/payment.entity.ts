import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentNumber: string; // Format: PAY-YYYY-MMMM-XXXXX

  @Column({ type: 'uuid' })
  invoiceId: string; // Reference to invoice

  @Column({ type: 'uuid', nullable: true })
  patientId: string; // Reference to patient (for faster queries)

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // Payment amount (can be partial)

  @Column({ enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'credit_note'], default: 'cash' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber: string; // Cheque/bank transfer reference

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  receivedBy: string; // Staff member who received payment

  @Column({ type: 'uuid', nullable: true })
  processedBy: string; // Staff member who processed payment

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
