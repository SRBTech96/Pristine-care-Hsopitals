import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bed } from './bed.entity';

@Entity('room_categories')
export class RoomCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // ICU, NICU, General, Private, Deluxe

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  capacity: number; // beds per room

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Bed, (bed) => bed.roomCategory)
  beds: Bed[];
}
