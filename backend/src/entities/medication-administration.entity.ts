import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MedicationSchedule } from './medication-schedule.entity';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';

@Entity('medication_administrations')
export class MedicationAdministration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicationScheduleId: string;

  @ManyToOne(() => MedicationSchedule, (schedule) => schedule.administrations)
  @JoinColumn({ name: 'medication_schedule_id' })
  medicationSchedule: MedicationSchedule;

  @Column()
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission;

  @Column()
  scheduledTime: Date;

  @Column({ nullable: true })
  administeredTime: Date;

  @Column({ nullable: true })
  administeredById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'administered_by_id' })
  administeredBy: User | null; // Staff Nurse

  @Column({ default: 'pending' })
  status: string; // pending, administered, refused, held, delayed, not_given

  @Column({ nullable: true })
  reasonIfNotGiven: string; // patient refusal, medication unavailable, patient NPO, etc.

  @Column({ nullable: true })
  actualDosage: string; // May differ from scheduled

  @Column({ nullable: true })
  routeUsed: string;

  @Column({ nullable: true })
  siteOfAdministration: string; // For IM/SC/IV injections

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  nurseNotes: string;

  @Column({ nullable: true })
  patientResponse: string;

  @Column({ default: false })
  sideEffectsObserved: boolean;

  @Column({ nullable: true })
  sideEffectsDetails: string;

  @Column({ nullable: true })
  verifiedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy: User | null;

  @Column({ nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
