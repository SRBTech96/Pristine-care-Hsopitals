import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('invoice_line_items')
export class InvoiceLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @Column({ type: 'varchar', length: 20, enum: ['appointment', 'lab_order', 'pharmacy_sale', 'service', 'other'], default: 'service' })
  lineType: string; // Type of line item

  @Column({ type: 'uuid', nullable: true })
  referenceId: string; // ID of appointment/lab_order/pharmacy_sale

  @Column({ type: 'text' })
  description: string; // Line item description

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineAmount: number; // quantity * unitPrice

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number; // Tax on this line item

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number; // Discount on this line item

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalLineAmount: number; // lineAmount + taxAmount - discountAmount

  @Column({ type: 'varchar', length: 20 })
  hsnCode: string; // HSN code for GST/Accounting

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
