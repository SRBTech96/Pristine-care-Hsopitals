import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DoctorOrder } from './doctor-order.entity';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';
import { MedicationAdministration } from './medication-administration.entity';

@Entity('medication_schedules')
export class MedicationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorOrderId: string;

  @ManyToOne(() => DoctorOrder, (order) => order.medicationSchedules)
  @JoinColumn({ name: 'doctor_order_id' })
  doctorOrder: DoctorOrder;

  @Column()
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.medicationSchedules)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission;

  @Column()
  medicationName: string;

  @Column()
  dosage: string;

  @Column()
  unit: string; // mg, ml, units, tablets, etc.

  @Column()
  frequency: string; // once daily, twice daily, every 6 hours, as needed, etc.

  @Column()
  route: string; // oral, IV, IM, SC, transdermal, topical, inhalation

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  durationDays: number;

  @Column({ nullable: true })
  specialInstructions: string;

  @Column({ nullable: true })
  contraindications: string;

  @Column({ nullable: true })
  allergiesToCheck: string;

  @Column({ default: false })
  requiresMonitoring: boolean;

  @Column({ nullable: true })
  monitoringParameters: string; // e.g., Blood Pressure, Heart Rate, etc.

  @Column()
  prescribingDoctorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribing_doctor_id' })
  prescribingDoctor: User;

  @CreateDateColumn()
  prescribedAt: Date;

  @Column({ default: 'active' })
  status: string; // active, completed, cancelled, paused

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MedicationAdministration, (admin) => admin.medicationSchedule)
  administrations: MedicationAdministration[];
}
