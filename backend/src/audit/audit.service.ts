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

  async logAudit(entry: Partial<AuditLog>) {
    const e = this.auditRepo.create(entry as AuditLog);
    return this.auditRepo.save(e);
  }

  async logDataAccess(entry: Partial<DataAccessLog>) {
    const e = this.dataAccessRepo.create(entry as DataAccessLog);
    return this.dataAccessRepo.save(e);
  }
}
