import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_tests' })
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_code', type: 'varchar', length: 50, unique: true })
  testCode: string;

  @Column({ name: 'test_name', type: 'varchar', length: 200 })
  testName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'sample_type', type: 'varchar', length: 100 })
  sampleType: string;

  @Column({ name: 'turnaround_time_hours', type: 'int' })
  turnaroundTimeHours: number;

  @Column({ name: 'cost', type: 'decimal', precision: 12, scale: 2 })
  cost: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
