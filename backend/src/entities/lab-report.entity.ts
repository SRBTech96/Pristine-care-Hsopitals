import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_reports' })
export class LabReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'report_number', type: 'varchar', length: 100, unique: true })
  reportNumber: string;

  @Column({ type: 'text' })
  results: string; // JSON field for flexible test results

  @Column({ name: 'reference_range', type: 'text', nullable: true })
  referenceRange?: string;

  @Column({ type: 'text', nullable: true })
  interpretation?: string;

  @Column({ name: 'report_date', type: 'timestamptz', default: () => 'NOW()' })
  reportDate: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approval_date', type: 'timestamptz', nullable: true })
  approvalDate?: Date;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
