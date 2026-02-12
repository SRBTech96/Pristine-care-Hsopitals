import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hr_employees' })
export class HrEmployee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 50, unique: true })
  employeeId: string;

  @Column({ name: 'employee_type', type: 'varchar', length: 50 })
  employeeType: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @Column({ name: 'designation', type: 'varchar', length: 100 })
  designation: string;

  @Column({ name: 'date_of_joining', type: 'date' })
  dateOfJoining: Date;

  @Column({ name: 'date_of_termination', type: 'date', nullable: true })
  dateOfTermination?: Date;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'bank_ifsc_code', type: 'varchar', length: 20, nullable: true })
  bankIfscCode?: string;

  @Column({ name: 'pan_number', type: 'varchar', length: 20, nullable: true })
  panNumber?: string;

  @Column({ name: 'aadhaar_number', type: 'varchar', length: 20, nullable: true })
  aadhaarNumber?: string;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100, nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
