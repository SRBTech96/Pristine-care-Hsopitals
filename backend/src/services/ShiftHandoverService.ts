// backend/src/services/ShiftHandoverService.ts
import { Repository } from 'typeorm';
import { ShiftHandover, HandoverStatus } from '../entities/ShiftHandover';
import { NurseUser } from '../entities/NurseUser';
import { Ward } from '../entities/Ward';

export interface CreateHandoverDTO {
  wardId: string;
  outgoingNurseId: string;
  pendingMedications: string;
  criticalPatients: string;
  pendingLabs: string;
  clinicalNotes: string;
  patientIds: string[];
}

export interface AcknowledgeHandoverDTO {
  handoverId: string;
  incomingNurseId: string;
}

export interface ReviewHandoverDTO {
  handoverId: string;
  reviewedByNurseId: string;
  reviewNotes: string;
}

export class ShiftHandoverService {
  constructor(private handoverRepository: Repository<ShiftHandover>) {}

  private logAudit(message: string, userId: string): string {
    return JSON.stringify({
      timestamp: new Date(),
      userId,
      message,
    });
  }

  async createHandover(dto: CreateHandoverDTO, userId: string): Promise<ShiftHandover> {
    const handover = new ShiftHandover();
    handover.wardId = dto.wardId;
    handover.outgoingNurseId = dto.outgoingNurseId;
    handover.pendingMedications = dto.pendingMedications;
    handover.criticalPatients = dto.criticalPatients;
    handover.pendingLabs = dto.pendingLabs;
    handover.clinicalNotes = dto.clinicalNotes;
    handover.patientIds = dto.patientIds;
    handover.status = HandoverStatus.PENDING;
    handover.auditLog = this.logAudit('Handover created', userId);

    return this.handoverRepository.save(handover);
  }

  async acknowledgeHandover(
    dto: AcknowledgeHandoverDTO,
    userId: string
  ): Promise<ShiftHandover> {
    const handover = await this.handoverRepository.findOne({
      where: { id: dto.handoverId },
    });

    if (!handover) {
      throw new Error('Handover not found');
    }

    handover.incomingNurseId = dto.incomingNurseId;
    handover.status = HandoverStatus.ACKNOWLEDGED;
    handover.acknowledgedAt = new Date();
    handover.auditLog = (handover.auditLog || '') + '\n' + this.logAudit('Handover acknowledged', userId);

    return this.handoverRepository.save(handover);
  }

  async reviewHandover(dto: ReviewHandoverDTO, userId: string): Promise<ShiftHandover> {
    const handover = await this.handoverRepository.findOne({
      where: { id: dto.handoverId },
    });

    if (!handover) {
      throw new Error('Handover not found');
    }

    if (handover.status !== HandoverStatus.ACKNOWLEDGED) {
      throw new Error('Handover must be acknowledged before review');
    }

    handover.status = HandoverStatus.REVIEWED;
    handover.reviewedByNurseId = dto.reviewedByNurseId;
    handover.reviewedAt = new Date();
    handover.reviewNotes = dto.reviewNotes;
    handover.auditLog = (handover.auditLog || '') + '\n' + this.logAudit('Handover reviewed', userId);

    return this.handoverRepository.save(handover);
  }

  async getHandoversByWard(wardId: string): Promise<ShiftHandover[]> {
    return this.handoverRepository.find({
      where: { wardId },
      order: { createdAt: 'DESC' },
      relations: ['outgoingNurse', 'incomingNurse', 'reviewedByNurse'],
    });
  }

  async getPendingHandovers(wardId: string): Promise<ShiftHandover[]> {
    return this.handoverRepository.find({
      where: { wardId, status: HandoverStatus.PENDING },
      relations: ['outgoingNurse'],
    });
  }

  async getHandoverById(id: string): Promise<ShiftHandover> {
    return this.handoverRepository.findOne({
      where: { id },
      relations: ['outgoingNurse', 'incomingNurse', 'reviewedByNurse', 'ward'],
    });
  }
}
