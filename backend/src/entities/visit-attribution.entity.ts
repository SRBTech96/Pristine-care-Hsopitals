import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'visit_attribution' })
export class VisitAttribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId: string;

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId?: string; // If this visit was converted from a lead

  @Column({ name: 'attribution_type', length: 50 })
  attributionType: string; // direct, referral, lead_conversion, email_campaign

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
