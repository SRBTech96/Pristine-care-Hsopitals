import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'salary_structures' })
export class SalaryStructure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom!: Date;

  @Column({ name: 'effective_till', type: 'date', nullable: true })
  effectiveTill?: Date;

  @Column({ name: 'base_salary', type: 'decimal', precision: 12, scale: 2 })
  baseSalary!: number;

  // Allowances (JSON for flexibility) - ✅ JSONB with proper typing
  @Column({ name: 'allowances', type: 'jsonb', nullable: true })
  allowances?: Record<string, number> | null; // { house_rent: 10000, medical: 5000, travel: 3000 }

  // Deductions (JSON for flexibility) - ✅ JSONB with proper typing
  @Column({ name: 'deductions', type: 'jsonb', nullable: true })
  deductions?: Record<string, number> | null; // { pf: 1800, gratuity: 500, loan: 2000 }

  // Gross salary = base + allowances - deductions
  @Column({ name: 'gross_salary', type: 'decimal', precision: 12, scale: 2, nullable: true })
  grossSalary?: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;
}
