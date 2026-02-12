// backend/src/entities/NurseQualityMetric.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Ward } from './ward.entity';

@Entity('nurse_quality_metrics')
export class NurseQualityMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  wardId: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'wardId' })
  ward: Ward;

  @Column({ type: 'uuid' })
  nurseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'nurseId' })
  nurse: User;

  @Column({ type: 'date' })
  metricDate: Date;

  @Column({ type: 'integer', default: 0 })
  totalMedicationsScheduled: number;

  @Column({ type: 'integer', default: 0 })
  medicationsOnTime: number;

  @Column({ type: 'integer', default: 0 })
  medicationsLate: number;

  @Column({ type: 'integer', default: 0 })
  medicationsMissed: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  medicationComplianceRate: number; // Percentage

  @Column({ type: 'integer', default: 0 })
  emergencyEventsResponded: number;

  @Column({ type: 'integer', default: 0 })
  emergencyResponseTimeSeconds: number; // Average

  @Column({ type: 'integer', default: 0 })
  vitalsRecorded: number;

  @Column({ type: 'integer', default: 0 })
  vitalsMissed: number;

  @Column({ type: 'integer', default: 0 })
  tasksAssigned: number;

  @Column({ type: 'integer', default: 0 })
  tasksCompleted: number;

  @Column({ type: 'integer', default: 0 })
  tasksOverdue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taskCompletionRate: number; // Percentage

  @Column({ type: 'integer', default: 0 })
  handoverSubmissions: number;

  @Column({ type: 'integer', default: 0 })
  handoverAcknowledgements: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  handoverAcknowledgementRate: number; // Percentage

  @Column({ type: 'integer', default: 0 })
  nursingNotesCreated: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  notationCompleteness: number; // Percentage

  @Column({ type: 'integer', default: 0 })
  patientsAssigned: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  workloadScore: number; // 0-100 scale

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  auditLog: string;
}
