import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'doctors' })
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'registration_number', type: 'varchar', length: 50, unique: true })
  registrationNumber: string;

  @Column({ name: 'specialization_id', type: 'uuid' })
  specializationId: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @Column({ type: 'text' })
  qualifications: string;

  @Column({ name: 'years_of_experience', type: 'int' })
  yearsOfExperience: number;

  @Column({ name: 'consultation_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  consultationFee?: number;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'availability_schedule', type: 'jsonb', nullable: true })
  availabilitySchedule?: Record<string, any> | null; // ✅ JSONB type with proper typing

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
