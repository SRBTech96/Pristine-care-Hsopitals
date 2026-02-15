import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Bed } from './bed.entity';
import { Ward } from './ward.entity';
import { User } from './user.entity';
import { DoctorOrder } from './doctor-order.entity';
import { MedicationSchedule } from './medication-schedule.entity';
import { VitalsRecord } from './vitals-record.entity';
import { EmergencyEvent } from './emergency-event.entity';

@Entity('inpatient_admissions')
export class InpatientAdmission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ type: 'uuid' })
  bedId!: string;

  @ManyToOne(() => Bed)
  @JoinColumn({ name: 'bed_id' })
  bed!: Bed;

  @Column({ type: 'uuid' })
  wardId!: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'ward_id' })
  ward!: Ward;

  @CreateDateColumn()
  admissionDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  dischargeDate: Date | null = null;

  @Column({ type: 'varchar', length: 20 })
  admissionType!: string; // emergency, scheduled, transfer

  @Column({ type: 'uuid' })
  attendingDoctorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'attending_doctor_id' })
  attendingDoctor!: User;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string | null = null;

  @Column({ type: 'text', nullable: true })
  admissionNotes: string | null = null;

  @Column({ type: 'text', nullable: true })
  dischargeSummary: string | null = null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string; // active, discharged, transferred, deceased

  @Column({ type: 'boolean', default: false })
  isIcu!: boolean;

  @Column({ type: 'boolean', default: false })
  isNicu!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy!: User;

  @OneToMany(() => DoctorOrder, (order) => order.admission)
  doctorOrders!: DoctorOrder[];

  @OneToMany(() => MedicationSchedule, (schedule) => schedule.admission)
  medicationSchedules!: MedicationSchedule[];

  @OneToMany(() => VitalsRecord, (record) => record.admission)
  vitalsRecords!: VitalsRecord[];

  @OneToMany(() => EmergencyEvent, (event) => event.admission)
  emergencyEvents!: EmergencyEvent[];
}
