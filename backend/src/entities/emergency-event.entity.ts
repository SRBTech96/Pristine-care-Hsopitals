import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InpatientAdmission } from './inpatient-admission.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity('emergency_events')
export class EmergencyEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.emergencyEvents, { nullable: true })
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission | null;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column()
  reportedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User; // Staff Nurse

  @Column()
  eventType: string; // cardiac arrest, respiratory distress, seizure, anaphylaxis, severe bleeding, code blue, etc.

  @Column()
  severity: string; // critical, high, medium, low

  @Column({ nullable: true })
  location: string; // Ward/Bed where event occurred

  @Column()
  description: string;

  @Column()
  timeOfEvent: Date;

  @Column({ nullable: true })
  responseStartTime: Date;

  @Column({ nullable: true })
  responseEndTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  doctorsNotifiedIds: string[]; // JSON array of doctor IDs notified

  @Column({ nullable: true })
  notifiedAt: Date;

  @Column({ nullable: true })
  actionsTaken: string;

  @Column({ nullable: true })
  outcome: string; // patient_stabilized, transferred_to_icu, clinical_death, etc.

  @Column({ default: 'reported' })
  status: string; // reported, acknowledged, in_progress, resolved, escalated

  @Column({ nullable: true })
  resolvingDoctorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolving_doctor_id' })
  resolvingDoctor: User | null;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ default: true })
  followUpRequired: boolean;

  @Column({ nullable: true })
  followUpNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
