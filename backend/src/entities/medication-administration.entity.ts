import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MedicationSchedule } from './medication-schedule.entity';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';

@Entity('medication_administrations')
export class MedicationAdministration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  medicationScheduleId: string;

  @ManyToOne(() => MedicationSchedule, (schedule) => schedule.administrations)
  @JoinColumn({ name: 'medication_schedule_id' })
  medicationSchedule: MedicationSchedule;

  @Column({ type: 'uuid' })
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission;

  @Column({ type: 'timestamptz' })
  scheduledTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  administeredTime: Date;

  @Column({ type: 'uuid', nullable: true })
  administeredById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'administered_by_id' })
  administeredBy: User | null; // Staff Nurse

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, administered, refused, held, delayed, not_given

  @Column({ type: 'text', nullable: true })
  reasonIfNotGiven: string; // patient refusal, medication unavailable, patient NPO, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  actualDosage: string; // May differ from scheduled

  @Column({ type: 'varchar', length: 50, nullable: true })
  routeUsed: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  siteOfAdministration: string; // For IM/SC/IV injections

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'text', nullable: true })
  nurseNotes: string;

  @Column({ type: 'text', nullable: true })
  patientResponse: string;

  @Column({ type: 'boolean', default: false })
  sideEffectsObserved: boolean;

  @Column({ type: 'text', nullable: true })
  sideEffectsDetails: string;

  @Column({ type: 'uuid', nullable: true })
  verifiedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
