import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity({ name: 'doctor_availability_slots' })
export class DoctorAvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor;

  // Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday
  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  // Start time as HH:mm (e.g., "09:00")
  @Column({ name: 'start_time', length: 5 })
  startTime: string;

  // End time as HH:mm (e.g., "17:00")
  @Column({ name: 'end_time', length: 5 })
  endTime: string;

  // Slot duration in minutes (e.g., 30 for 30-min slots)
  @Column({ name: 'slot_duration_minutes', type: 'int' })
  slotDurationMinutes: number;

  // Whether this slot is active (can override per slot)
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;
}
