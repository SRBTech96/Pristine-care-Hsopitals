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

  @Column({ name: 'sku', length: 50, unique: true })
  sku!: string; // internal SKU or drug code

  @Column({ name: 'name', length: 200 })
  name!: string; // Drug name

  @Column({ name: 'manufacturer', length: 200, nullable: true })
  manufacturer!: string | null; // ✅ Correctly typed as VARCHAR, not Object

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number; // default selling price

  @Column({ name: 'hsn_code', length: 50, nullable: true })
  hsnCode!: string | null; // HSN (Harmonized System of Nomenclature) code
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;
}
