import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hr_offer_letters' })
export class HrOfferLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'offer_date', type: 'date' })
  offerDate: Date;

  @Column({ name: 'designation', length: 100 })
  designation: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salary: number;

  @Column({ name: 'joining_date', type: 'date', nullable: true })
  joiningDate?: Date;

  @Column({ type: 'text', nullable: true })
  terms?: string; // JSON or text field for contract terms

  @Column({ name: 'offer_letter_url', type: 'text', nullable: true })
  offerLetterUrl?: string; // URL to generated PDF

  @Column({ name: 'acceptance_date', type: 'date', nullable: true })
  acceptanceDate?: Date;

  @Column({ name: 'signing_date', type: 'date', nullable: true })
  signingDate?: Date;

  @Column({ length: 50, default: 'draft' })
  status: string; // draft, sent, accepted, rejected, signed, expired

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
