import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'patient_leads' })
export class PatientLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 100, nullable: true })
  source?: string; // referral, website, walk-in, advertisement, employee_referral

  @Column({ length: 50, default: 'new' })
  status: string; // new, contacted, qualified, converted, lost

  @Column({ name: 'interested_in', length: 255, nullable: true })
  interestedIn?: string; // specialization or department

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
