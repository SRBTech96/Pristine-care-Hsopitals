import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Ward } from './ward.entity';

@Entity('nurse_assignments')
export class NurseAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nurseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'nurse_id' })
  nurse: User;

  @Column({ nullable: true })
  wardId: string;

  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward | null;

  @Column({ nullable: true })
  floorNumber: number;

  @Column({ type: 'jsonb', nullable: true })
  assignedBeds: string[]; // JSON array of bed IDs or ranges

  @Column({ nullable: true })
  shiftStartTime: string; // TIME format

  @Column({ nullable: true })
  shiftEndTime: string; // TIME format

  @Column({ nullable: true })
  shiftDate: Date;

  @Column()
  assignedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy: User; // Head Nurse

  @Column({ default: 'active' })
  status: string; // active, completed, cancelled

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
