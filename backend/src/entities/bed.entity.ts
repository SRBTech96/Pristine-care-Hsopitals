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

  @Column({ type: 'varchar', length: 50, unique: true })
  bedCode!: string; // ICU-01-A, NICU-02-B, GW-03-C

  @Column({ type: 'uuid' })
  wardId!: string;

  @Column({ type: 'uuid' })
  roomCategoryId!: string;

  @ManyToOne(() => Ward, (ward) => ward.beds)
  @JoinColumn({ name: 'ward_id' })
  ward!: Ward;

  @ManyToOne(() => RoomCategory, (roomCategory) => roomCategory.beds)
  @JoinColumn({ name: 'room_category_id' })
  roomCategory!: RoomCategory;

  @Column({ type: 'varchar', length: 50, nullable: true })
  roomNumber!: string; // Physical room number if applicable

  @Column({ type: 'int', nullable: true })
  floorNumber!: number; // Inherited from ward

  @Column({ type: 'varchar', length: 10, nullable: true })
  bedPosition!: string; // A, B, C, D (for multi-bed rooms)

  @Column({ type: 'varchar', length: 20, default: 'vacant' })
  status!: BedStatus; // vacant, occupied, maintenance, reserved

  @Column({ type: 'uuid', nullable: true })
  currentPatientId!: string | null;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'current_patient_id' })
  currentPatient!: Patient | null;

  @Column({ type: 'uuid', nullable: true })
  assignedToUserId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedToUser!: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  admissionDate!: Date | null; // When patient admitted to bed

  @Column({ type: 'timestamptz', nullable: true })
  estimatedDischargeDate!: Date;

  @Column({ type: 'text', nullable: true })
  specialRequirements!: string; // Oxygen, Dialysis, Ventilator, etc.

  @Column({ type: 'boolean', default: true })
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
