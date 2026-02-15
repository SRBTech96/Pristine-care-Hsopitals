import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DoctorOrder } from './doctor-order.entity';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';
import { MedicationAdministration } from './medication-administration.entity';

@Entity('medication_schedules')
export class MedicationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  doctorOrderId: string;

  @ManyToOne(() => DoctorOrder, (order) => order.medicationSchedules)
  @JoinColumn({ name: 'doctor_order_id' })
  doctorOrder: DoctorOrder;

  @Column({ type: 'uuid' })
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.medicationSchedules)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission;

  @Column({ type: 'varchar', length: 200 })
  medicationName: string;

  @Column({ type: 'varchar', length: 100 })
  dosage: string;

  @Column({ type: 'varchar', length: 20 })
  unit: string; // mg, ml, units, tablets, etc.

  @Column({ type: 'varchar', length: 50 })
  frequency: string; // once daily, twice daily, every 6 hours, as needed, etc.

  @Column({ type: 'varchar', length: 50 })
  route: string; // oral, IV, IM, SC, transdermal, topical, inhalation

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  durationDays: number;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'text', nullable: true })
  contraindications: string;

  @Column({ type: 'text', nullable: true })
  allergiesToCheck: string;

  @Column({ type: 'boolean', default: false })
  requiresMonitoring: boolean;

  @Column({ type: 'text', nullable: true })
  monitoringParameters: string; // e.g., Blood Pressure, Heart Rate, etc.

  @Column({ type: 'uuid' })
  prescribingDoctorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribing_doctor_id' })
  prescribingDoctor: User;

  @CreateDateColumn()
  prescribedAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, completed, cancelled, paused

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MedicationAdministration, (admin) => admin.medicationSchedule)
  administrations: MedicationAdministration[];
}
