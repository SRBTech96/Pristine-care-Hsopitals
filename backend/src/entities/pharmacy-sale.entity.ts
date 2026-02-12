import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pharmacy_sales' })
export class PharmacySale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'invoice_number', length: 100, unique: true })
  invoiceNumber!: string;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId!: string;

  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId!: string | null;

  @Column({ name: 'quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 12, scale: 2 })
  finalAmount!: number;

  @Column({ name: 'prescription_id', type: 'uuid', nullable: true })
  prescriptionId!: string | null;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId!: string | null;

  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId!: string | null;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId!: string | null;

  @Column({ name: 'payment_method', length: 20 })
  paymentMethod!: string; // cash, bank, upi, card

  @Column({ name: 'payment_reference', type: 'text', nullable: true })
  paymentReference!: string | null;

  @Column({ name: 'sale_date', type: 'timestamptz', default: () => 'NOW()' })
  saleDate!: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;
}
