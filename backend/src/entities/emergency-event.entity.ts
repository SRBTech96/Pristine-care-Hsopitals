import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InpatientAdmission } from './inpatient-admission.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity('emergency_events')
export class EmergencyEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.emergencyEvents, { nullable: true })
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission | null;

  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid' })
  reportedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User; // Staff Nurse

  @Column({ type: 'varchar', length: 50 })
  eventType: string; // cardiac arrest, respiratory distress, seizure, anaphylaxis, severe bleeding, code blue, etc.

  @Column({ type: 'varchar', length: 20 })
  severity: string; // critical, high, medium, low

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string; // Ward/Bed where event occurred

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  timeOfEvent: Date;

  @Column({ type: 'timestamptz', nullable: true })
  responseStartTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  responseEndTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  doctorsNotifiedIds: string[]; // JSON array of doctor IDs notified

  @Column({ type: 'timestamptz', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  actionsTaken: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  outcome: string; // patient_stabilized, transferred_to_icu, clinical_death, etc.

  @Column({ type: 'varchar', length: 20, default: 'reported' })
  status: string; // reported, acknowledged, in_progress, resolved, escalated

  @Column({ type: 'uuid', nullable: true })
  resolvingDoctorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolving_doctor_id' })
  resolvingDoctor: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'boolean', default: true })
  followUpRequired: boolean;

  @Column({ type: 'text', nullable: true })
  followUpNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
