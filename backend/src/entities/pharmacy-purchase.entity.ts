import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pharmacy_purchases' })
export class PharmacyPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'purchase_number', length: 100, unique: true })
  purchaseNumber: string;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 12, scale: 2 })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2 })
  totalCost: number;

  @Column({ name: 'vendor', length: 200, nullable: true })
  vendor?: string;

  @Column({ name: 'purchase_date', type: 'date', default: () => 'CURRENT_DATE' })
  purchaseDate: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
