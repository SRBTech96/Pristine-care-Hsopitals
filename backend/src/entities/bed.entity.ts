import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ward } from './ward.entity';
import { RoomCategory } from './room-category.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { BedStatusHistory } from './bed-status-history.entity';

export type BedStatus = 'vacant' | 'occupied' | 'maintenance' | 'reserved';

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  bedCode!: string; // ICU-01-A, NICU-02-B, GW-03-C

  @Column()
  wardId!: string;

  @Column()
  roomCategoryId!: string;

  @ManyToOne(() => Ward, (ward) => ward.beds)
  @JoinColumn({ name: 'ward_id' })
  ward!: Ward;

  @ManyToOne(() => RoomCategory, (roomCategory) => roomCategory.beds)
  @JoinColumn({ name: 'room_category_id' })
  roomCategory!: RoomCategory;

  @Column({ nullable: true })
  roomNumber!: string; // Physical room number if applicable

  @Column({ nullable: true })
  floorNumber!: number; // Inherited from ward

  @Column({ nullable: true })
  bedPosition!: string; // A, B, C, D (for multi-bed rooms)

  @Column({ default: 'vacant' })
  status!: BedStatus; // vacant, occupied, maintenance, reserved

  @Column({ nullable: true })
  currentPatientId!: string | null;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'current_patient_id' })
  currentPatient!: Patient | null;

  @Column({ nullable: true })
  assignedToUserId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedToUser!: User | null;

  @Column({ nullable: true })
  admissionDate!: Date | null; // When patient admitted to bed

  @Column({ nullable: true })
  estimatedDischargeDate!: Date;

  @Column({ nullable: true })
  specialRequirements!: string; // Oxygen, Dialysis, Ventilator, etc.

  @Column({ default: true })
  isActive!: boolean;

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

  @OneToMany(() => BedStatusHistory, (history) => history.bed)
  statusHistory!: BedStatusHistory[];
}
