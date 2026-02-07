import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hr_leave_records' })
export class HrLeaveRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'leave_type', length: 50 })
  leaveType: string; // sick, casual, earned, unpaid, maternity, attendance_bonus

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'number_of_days', type: 'int' })
  numberOfDays: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ length: 50, default: 'pending' })
  status: string; // pending, approved, rejected, cancelled

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments?: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approval_date', type: 'timestamptz', nullable: true })
  approvalDate?: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
