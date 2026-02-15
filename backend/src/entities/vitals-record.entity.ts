import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';

@Entity('vitals_records')
export class VitalsRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  inpatientAdmissionId!: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.vitalsRecords)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission!: InpatientAdmission;

  @Column({ type: 'uuid' })
  recordedById!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy!: User; // Staff Nurse

  @Column({ type: 'timestamptz' })
  recordedAt!: Date;

  @Column({ type: 'numeric', precision: 4, scale: 1, nullable: true })
  temperatureCelsius!: number;

  @Column({ type: 'int', nullable: true })
  heartRateBpm!: number;

  @Column({ type: 'int', nullable: true })
  systolicBp!: number;

  @Column({ type: 'int', nullable: true })
  diastolicBp!: number;

  @Column({ type: 'int', nullable: true })
  respiratoryRateRpm!: number;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  oxygenSaturationPercent!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  bloodGlucoseMmol!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg!: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  heightCm!: number;

  @Column({ type: 'int', nullable: true })
  painScore!: number;

  @Column({ type: 'int', nullable: true })
  gcsScore!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  consciousnessLevel!: string;

  @Column({ type: 'int', nullable: true })
  urineOutputMl!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bowelMovementStatus!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'boolean', default: false })
  abnormalFindings!: boolean;

  @Column({ type: 'uuid', nullable: true })
  reportedToDoctorId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reported_to_doctor_id' })
  reportedToDoctor!: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  reportedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
