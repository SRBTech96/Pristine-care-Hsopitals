// backend/src/entities/ShiftHandover.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { NurseUser } from './NurseUser';
import { Ward } from './Ward';
import { InpatientAdmission } from './InpatientAdmission';

export enum HandoverStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  REVIEWED = 'reviewed',
}

@Entity('shift_handovers')
export class ShiftHandover {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  wardId: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'wardId' })
  ward: Ward;

  @Column({ type: 'uuid' })
  outgoingNurseId: string;

  @ManyToOne(() => NurseUser)
  @JoinColumn({ name: 'outgoingNurseId' })
  outgoingNurse: NurseUser;

  @Column({ type: 'uuid', nullable: true })
  incomingNurseId: string;

  @ManyToOne(() => NurseUser, { nullable: true })
  @JoinColumn({ name: 'incomingNurseId' })
  incomingNurse: NurseUser;

  @Column({ type: 'varchar', enum: HandoverStatus, default: HandoverStatus.PENDING })
  status: HandoverStatus;

  @Column({ type: 'text', nullable: true })
  pendingMedications: string;

  @Column({ type: 'text', nullable: true })
  criticalPatients: string;

  @Column({ type: 'text', nullable: true })
  pendingLabs: string;

  @Column({ type: 'text' })
  clinicalNotes: string;

  @Column({ type: 'simple-array', nullable: true })
  patientIds: string[];

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedByNurseId: string;

  @ManyToOne(() => NurseUser, { nullable: true })
  @JoinColumn({ name: 'reviewedByNurseId' })
  reviewedByNurse: NurseUser;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  auditLog: string; // JSON array of audit events
}
