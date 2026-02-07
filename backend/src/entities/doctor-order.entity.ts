import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';
import { MedicationSchedule } from './medication-schedule.entity';

@Entity('doctor_orders')
export class DoctorOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.doctorOrders)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission;

  @Column()
  doctorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @CreateDateColumn()
  orderDate: Date;

  @Column()
  orderType: string; // medication, procedure, investigation, diet, activity, observation

  @Column()
  description: string;

  @Column({ nullable: true })
  instructions: string;

  @Column({ default: 'normal' })
  priority: string; // routine, urgent, stat

  @Column({ default: 'active' })
  status: string; // active, completed, cancelled, on_hold

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  expectedCompletionDate: Date;

  @Column({ default: false })
  approvalsRequired: boolean;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User | null;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  cancelledById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User | null;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MedicationSchedule, (schedule) => schedule.doctorOrder, { nullable: true })
  medicationSchedules: MedicationSchedule[];
}
