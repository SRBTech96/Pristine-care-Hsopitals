import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Bed } from './bed.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity('bed_status_history')
export class BedStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bed_id' })
  bedId: string;

  @ManyToOne(() => Bed, (bed) => bed.statusHistory)
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @Column()
  previousStatus: string;

  @Column()
  newStatus: string;

  @Column({ nullable: true })
  previousPatientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'previous_patient_id' })
  previousPatient: Patient | null;

  @Column({ nullable: true })
  newPatientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'new_patient_id' })
  newPatient: Patient | null;

  @Column()
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedBy: User;

  @Column({ nullable: true })
  changeReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
