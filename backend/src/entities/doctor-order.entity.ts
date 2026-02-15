import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InpatientAdmission } from './inpatient-admission.entity';
import { User } from './user.entity';
import { MedicationSchedule } from './medication-schedule.entity';

@Entity('doctor_orders')
export class DoctorOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inpatientAdmissionId: string;

  @ManyToOne(() => InpatientAdmission, (admission) => admission.doctorOrders)
  @JoinColumn({ name: 'inpatient_admission_id' })
  admission: InpatientAdmission;

  @Column({ type: 'uuid' })
  doctorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @CreateDateColumn()
  orderDate: Date;

  @Column({ type: 'varchar', length: 50 })
  orderType: string; // medication, procedure, investigation, diet, activity, observation

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  priority: string; // routine, urgent, stat

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, completed, cancelled, on_hold

  @Column({ type: 'timestamptz', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expectedCompletionDate: Date;

  @Column({ type: 'boolean', default: false })
  approvalsRequired: boolean;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelledById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MedicationSchedule, (schedule) => schedule.doctorOrder, { nullable: true })
  medicationSchedules: MedicationSchedule[];
}
