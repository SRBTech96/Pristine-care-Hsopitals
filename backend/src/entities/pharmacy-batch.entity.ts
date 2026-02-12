import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pharmacy_batches' })
export class PharmacyBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId!: string;

  @Column({ name: 'batch_number', type: 'varchar', length: 100 })
  batchNumber!: string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate!: Date;

  @Column({ name: 'quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2 })
  costPrice!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;
}
