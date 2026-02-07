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
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column()
  bedId: string;

  @ManyToOne(() => Bed)
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @Column()
  wardId: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;

  @CreateDateColumn()
  admissionDate: Date;

  @Column({ nullable: true })
  dischargeDate: Date;

  @Column()
  admissionType: string; // emergency, scheduled, transfer

  @Column()
  attendingDoctorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'attending_doctor_id' })
  attendingDoctor: User;

  @Column({ nullable: true })
  chiefComplaint: string;

  @Column({ nullable: true })
  admissionNotes: string;

  @Column({ nullable: true })
  dischargeSummary: string;

  @Column({ default: 'active' })
  status: string; // active, discharged, transferred, deceased

  @Column({ default: false })
  isIcu: boolean;

  @Column({ default: false })
  isNicu: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @OneToMany(() => DoctorOrder, (order) => order.admission)
  doctorOrders: DoctorOrder[];

  @OneToMany(() => MedicationSchedule, (schedule) => schedule.admission)
  medicationSchedules: MedicationSchedule[];

  @OneToMany(() => VitalsRecord, (record) => record.admission)
  vitalsRecords: VitalsRecord[];

  @OneToMany(() => EmergencyEvent, (event) => event.admission)
  emergencyEvents: EmergencyEvent[];
}
