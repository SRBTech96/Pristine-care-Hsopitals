import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Ward } from './ward.entity';

@Entity('nurse_assignments')
export class NurseAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  nurseId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'nurse_id' })
  nurse!: User;

  @Column({ type: 'uuid', nullable: true })
  wardId: string | null = null;

  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward | null = null;

  @Column({ type: 'int', nullable: true })
  floorNumber: number | null = null;

  @Column({ type: 'jsonb', nullable: true })
  assignedBeds: string[] | null = null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  shiftStartTime: string | null = null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  shiftEndTime: string | null = null;

  @Column({ type: 'date', nullable: true })
  shiftDate: Date | null = null;

  @Column({ type: 'uuid' })
  assignedById!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy!: User; // Head Nurse

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string; // active, completed, cancelled

  @Column({ type: 'text', nullable: true })
  notes: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
