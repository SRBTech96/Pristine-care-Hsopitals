import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'discount_approvals' })
export class DiscountApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'target_type', type: 'varchar', length: 100 })
  targetType: string; // appointment, patient_lead, bundle, service

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ name: 'discount_percentage', type: 'int', nullable: true })
  discountPercentage?: number; // 0-100

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ type: 'text', nullable: true })
  reason?: string; // Why discount was approved

  @Column({ name: 'approved_by', type: 'uuid' })
  approvedBy: string; // Must be ADMIN or higher

  @Column({ name: 'approval_date', type: 'timestamptz', default: () => 'NOW()' })
  approvalDate: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'varchar', length: 50, default: 'approved' })
  status: string; // pending, approved, rejected, expired, used

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
