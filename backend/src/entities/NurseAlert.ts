// backend/src/entities/NurseAlert.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Ward } from './ward.entity';
import { InpatientAdmission } from './inpatient-admission.entity';

export enum AlertType {
  OVERDUE_MEDICATION = 'overdue_medication',
  UNACKNOWLEDGED_EMERGENCY = 'unacknowledged_emergency',
  MISSED_VITALS = 'missed_vitals',
  PENDING_LAB_RESULT = 'pending_lab_result',
  TASK_OVERDUE = 'task_overdue',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

@Entity('nurse_alerts')
export class NurseAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  wardId: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'wardId' })
  ward: Ward;

  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => InpatientAdmission)
  @JoinColumn({ name: 'patientId' })
  patient: InpatientAdmission;

  @Column({ type: 'varchar', enum: AlertType })
  type: AlertType;

  @Column({ type: 'varchar', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ type: 'varchar', enum: AlertStatus, default: AlertStatus.OPEN })
  status: AlertStatus;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToNurseId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToNurseId' })
  assignedToNurse: User;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  acknowledgedByNurseId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledgedByNurseId' })
  acknowledgedByNurse: User;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  escalatedToNurseId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'escalatedToNurseId' })
  escalatedToNurse: User;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  auditLog: string; // JSON array of state changes
}
