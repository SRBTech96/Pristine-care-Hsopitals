import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';

@Entity('vitals_records')
export class VitalsRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  inpatientAdmissionId!: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.vitalsRecords)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission!: InpatientAdmission;

  @Column()
  recordedById!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy!: User; // Staff Nurse

  @Column()
  recordedAt!: Date;

  @Column({ type: 'numeric', precision: 4, scale: 1, nullable: true })
  temperatureCelsius!: number;

  @Column({ nullable: true })
  heartRateBpm!: number;

  @Column({ nullable: true })
  systolicBp!: number;

  @Column({ nullable: true })
  diastolicBp!: number;

  @Column({ nullable: true })
  respiratoryRateRpm!: number;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  oxygenSaturationPercent!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  bloodGlucoseMmol!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg!: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  heightCm!: number;

  @Column({ nullable: true })
  painScore!: number;

  @Column({ nullable: true })
  gcsScore!: number;

  @Column({ nullable: true })
  consciousnessLevel!: string;

  @Column({ nullable: true })
  urineOutputMl!: number;

  @Column({ nullable: true })
  bowelMovementStatus!: string;

  @Column({ nullable: true })
  notes!: string;

  @Column({ default: false })
  abnormalFindings!: boolean;

  @Column({ nullable: true })
  reportedToDoctorId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reported_to_doctor_id' })
  reportedToDoctor!: User | null;

  @Column({ nullable: true })
  reportedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
