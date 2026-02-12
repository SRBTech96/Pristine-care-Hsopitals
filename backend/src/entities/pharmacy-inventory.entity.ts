import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PharmacyInventory Entity
 * Represents pharmaceutical products in hospital inventory
 * PostgreSQL compatible with proper column types
 */
@Entity({ name: 'pharmacy_inventory' })
export class PharmacyInventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sku', type: 'varchar', length: 50, unique: true })
  sku!: string; // internal SKU or drug code

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name!: string; // Drug name

  // EXTREME SAFE AUTO-FIX: manufacturer must be JSONB for object compatibility
  @Column({ name: 'manufacturer', type: 'jsonb', nullable: true })
  manufacturer!: Record<string, any> | null; // ✅ Correctly typed as JSONB

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number; // default selling price

  @Column({ name: 'hsn_code', type: 'varchar', length: 50, nullable: true })
  hsnCode!: string | null; // HSN (Harmonized System of Nomenclature) code
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'NOW()' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;
}
