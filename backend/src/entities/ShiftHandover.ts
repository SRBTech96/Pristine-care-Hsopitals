// backend/src/entities/ShiftHandover.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Ward } from './ward.entity';

export enum HandoverStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  REVIEWED = 'reviewed',
}

@Entity('shift_handovers')
export class ShiftHandover {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  wardId!: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'wardId' })
  ward!: Ward;

  @Column({ type: 'uuid' })
  outgoingNurseId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'outgoingNurseId' })
  outgoingNurse!: User;

  @Column({ type: 'uuid', nullable: true })
  incomingNurseId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'incomingNurseId' })
  incomingNurse!: User;

  @Column({ type: 'varchar', enum: HandoverStatus, default: HandoverStatus.PENDING })
  status!: HandoverStatus;

  @Column({ type: 'text', nullable: true })
  pendingMedications!: string;

  @Column({ type: 'text', nullable: true })
  criticalPatients!: string;

  @Column({ type: 'text', nullable: true })
  pendingLabs!: string;

  @Column({ type: 'text' })
  clinicalNotes!: string;

  @Column({ type: 'simple-array', nullable: true })
  patientIds!: string[];

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedByNurseId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewedByNurseId' })
  reviewedByNurse!: User;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt!: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'text', nullable: true })
  auditLog!: string; // JSON array of audit events
}
