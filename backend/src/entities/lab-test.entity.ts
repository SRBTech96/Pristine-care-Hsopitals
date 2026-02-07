import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_tests' })
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_code', length: 50, unique: true })
  testCode: string;

  @Column({ name: 'test_name', length: 200 })
  testName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'sample_type', length: 100 })
  sampleType: string; // blood, urine, saliva, tissue, etc.

  @Column({ name: 'turnaround_time_hours', type: 'int' })
  turnaroundTimeHours: number;

  @Column({ name: 'cost', type: 'decimal', precision: 12, scale: 2 })
  cost: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
