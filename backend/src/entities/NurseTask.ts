// backend/src/entities/NurseTask.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Ward } from './ward.entity';
import { InpatientAdmission } from './inpatient-admission.entity';

export enum TaskType {
  MEDICATION = 'medication',
  VITAL_SIGNS = 'vital_signs',
  OBSERVATION = 'observation',
  CARE_ACTIVITY = 'care_activity',
  ACKNOWLEDGEMENT = 'acknowledgement',
  DOCUMENTATION = 'documentation',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('nurse_tasks')
export class NurseTask {
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

  @Column({ type: 'uuid' })
  assignedToNurseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToNurseId' })
  assignedToNurse: User;

  @Column({ type: 'varchar', enum: TaskType })
  type: TaskType;

  @Column({ type: 'varchar', enum: TaskPriority })
  priority: TaskPriority;

  @Column({ type: 'varchar', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdByNurseId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByNurseId' })
  createdByNurse?: User;

  @Column({ type: 'text', nullable: true })
  completionNotes?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>; // Additional task-specific data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  auditLog: string;
}
