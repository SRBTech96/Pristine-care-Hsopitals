import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Column({ name: 'actor_role', type: 'varchar', length: 50 })
  actorRole: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: Record<string, any> | null; // ✅ JSONB type - old field values

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: Record<string, any> | null; // ✅ JSONB type - new field values

  @Column({ name: 'changes_summary', type: 'text', nullable: true })
  changesSummary?: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true })
  requestId?: string;

  @Column({ type: 'varchar', length: 50, default: 'info' })
  severity: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;
}
