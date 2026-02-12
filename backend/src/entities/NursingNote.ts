// backend/src/entities/NursingNote.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { InpatientAdmission } from './inpatient-admission.entity';
import { Ward } from './ward.entity';

export enum NoteFormat {
  SOAP = 'soap',
  FREE_TEXT = 'free_text',
}

export enum SoapSection {
  SUBJECTIVE = 'subjective',
  OBJECTIVE = 'objective',
  ASSESSMENT = 'assessment',
  PLAN = 'plan',
}

@Entity('nursing_notes')
export class NursingNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => InpatientAdmission)
  @JoinColumn({ name: 'patientId' })
  patient!: InpatientAdmission;

  @Column({ type: 'uuid' })
  wardId!: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'wardId' })
  ward!: Ward;

  @Column({ type: 'uuid' })
  nurseId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'nurseId' })
  nurse!: User;

  @Column({ type: 'varchar', enum: NoteFormat })
  format!: NoteFormat;

  // For SOAP notes
  @Column({ type: 'text', nullable: true })
  subjective: string | null = null;

  @Column({ type: 'text', nullable: true })
  objective: string | null = null;

  @Column({ type: 'text', nullable: true })
  assessment: string | null = null;

  @Column({ type: 'text', nullable: true })
  plan: string | null = null;

  // For free text notes
  @Column({ type: 'text', nullable: true })
  content: string | null = null;

  @Column({ type: 'varchar', nullable: true })
  category: string | null = null; // e.g., 'pain', 'wound_care', 'behavior', 'general'

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'text', nullable: true })
  auditLog: string | null = null;
}
