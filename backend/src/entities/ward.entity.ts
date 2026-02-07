import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Bed } from './bed.entity';

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // ICU, General Ward, NICU, OPD

  @Column({ unique: true })
  code: string; // ICU-01, GW-01, NICU-01

  @Column({ nullable: true })
  floorNumber: number;

  @Column({ nullable: true })
  building: string;

  @Column({ default: 0 })
  totalBeds: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

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

  @OneToMany(() => Bed, (bed) => bed.ward)
  beds: Bed[];
}
