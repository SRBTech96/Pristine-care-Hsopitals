import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'data_access_logs' })
export class DataAccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId?: string;

  @Column({ name: 'access_type', type: 'varchar', length: 50 })
  accessType: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId?: string;

  @Column({ type: 'text', nullable: true })
  purpose?: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ name: 'success', type: 'boolean', default: true })
  success: boolean;

  @Column({ name: 'result_code', type: 'varchar', length: 50, nullable: true })
  resultCode?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;
}
