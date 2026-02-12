// backend/src/services/NurseAlertService.ts
import { Repository } from 'typeorm';
import { NurseAlert, AlertType, AlertSeverity, AlertStatus } from '../entities/NurseAlert';

export interface CreateAlertDTO {
  wardId: string;
  patientId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  assignedToNurseId?: string;
}

export interface AcknowledgeAlertDTO {
  alertId: string;
  acknowledgedByNurseId: string;
}

export interface EscalateAlertDTO {
  alertId: string;
  escalatedToNurseId: string;
}

export interface ResolveAlertDTO {
  alertId: string;
  resolutionNotes: string;
}

export class NurseAlertService {
  constructor(private alertRepository: Repository<NurseAlert>) {}

  private logAudit(message: string, userId: string): string {
    return JSON.stringify({
      timestamp: new Date(),
      userId,
      message,
    });
  }

  async createAlert(dto: CreateAlertDTO, userId: string): Promise<NurseAlert> {
    const alert = new NurseAlert();
    alert.wardId = dto.wardId;
    alert.patientId = dto.patientId;
    alert.type = dto.type;
    alert.severity = dto.severity;
    alert.title = dto.title;
    alert.description = dto.description;
    alert.assignedToNurseId = dto.assignedToNurseId || undefined;
    alert.status = AlertStatus.OPEN;
    alert.auditLog = this.logAudit('Alert created', userId);

    return this.alertRepository.save(alert);
  }

  async acknowledgeAlert(dto: AcknowledgeAlertDTO, userId: string): Promise<NurseAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: dto.alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedByNurseId = dto.acknowledgedByNurseId;
    alert.auditLog = (alert.auditLog || '') + '\n' + this.logAudit('Alert acknowledged', userId);

    return this.alertRepository.save(alert);
  }

  async escalateAlert(dto: EscalateAlertDTO, userId: string): Promise<NurseAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: dto.alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = AlertStatus.ESCALATED;
    alert.escalatedAt = new Date();
    alert.escalatedToNurseId = dto.escalatedToNurseId;
    alert.auditLog = (alert.auditLog || '') + '\n' + this.logAudit('Alert escalated', userId);

    return this.alertRepository.save(alert);
  }

  async resolveAlert(dto: ResolveAlertDTO, userId: string): Promise<NurseAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: dto.alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.resolutionNotes = dto.resolutionNotes;
    alert.auditLog = (alert.auditLog || '') + '\n' + this.logAudit('Alert resolved', userId);

    return this.alertRepository.save(alert);
  }

  async getAlertsByWard(wardId: string, status?: string, severity?: string, limit: number = 50, offset: number = 0): Promise<NurseAlert[]> {
    const query = this.alertRepository.createQueryBuilder('alert')
      .where('alert.wardId = :wardId', { wardId })
      .orderBy('alert.severity', 'DESC')
      .addOrderBy('alert.createdAt', 'DESC')
      .leftJoinAndSelect('alert.patient', 'patient')
      .leftJoinAndSelect('alert.assignedToNurse', 'assignedNurse');

    if (status) {
      query.andWhere('alert.status = :status', { status });
    }

    return query.skip(offset).take(limit).getMany();
  }

  async getAlertsByNurse(nurseId: string, status?: string, limit: number = 50, offset: number = 0): Promise<NurseAlert[]> {
    const query = this.alertRepository.createQueryBuilder('alert')
      .where('alert.assignedToNurseId = :nurseId', { nurseId })
      .orderBy('alert.severity', 'DESC')
      .addOrderBy('alert.createdAt', 'DESC')
      .leftJoinAndSelect('alert.patient', 'patient');

    if (status) {
      query.andWhere('alert.status = :status', { status });
    }

    return query.skip(offset).take(limit).getMany();
  }

  async getAlertById(alertId: string): Promise<NurseAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
      relations: ['patient', 'assignedToNurse', 'ward'],
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    return alert;
  }

  async getOpenAlerts(wardId: string): Promise<NurseAlert[]> {
    return this.alertRepository.find({
      where: { wardId, status: AlertStatus.OPEN },
      order: { severity: 'DESC', createdAt: 'DESC' },
      relations: ['patient', 'assignedToNurse'],
    });
  }

  async getCriticalAlerts(wardId: string): Promise<NurseAlert[]> {
    return this.alertRepository.find({
      where: { wardId, severity: AlertSeverity.CRITICAL },
      order: { createdAt: 'DESC' },
      relations: ['patient'],
    });
  }
}
