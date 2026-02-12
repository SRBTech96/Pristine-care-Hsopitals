import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_samples' })
export class LabSample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'sample_code', type: 'varchar', length: 100, unique: true })
  sampleCode: string;

  @Column({ name: 'collection_date', type: 'timestamptz' })
  collectionDate: Date;

  @Column({ name: 'collector_id', type: 'uuid' })
  collectorId: string;

  @Column({ name: 'sample_quality', type: 'varchar', length: 50, default: 'good' })
  sampleQuality: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;
}
