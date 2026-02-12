import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { DataAccessLog } from '../entities/data-access-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(DataAccessLog) private dataAccessRepo: Repository<DataAccessLog>
  ) {}

  async logAccess(payload: unknown): Promise<void> {
    // No-op for now
  }

  async logDataAccess(payload: unknown): Promise<void> {
    // No-op for now
  }

  async logAudit(payload: unknown): Promise<void> {
    // No-op for now
  }
}
