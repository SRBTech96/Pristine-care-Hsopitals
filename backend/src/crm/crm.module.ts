import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientLead } from '../entities/patient-lead.entity';
import { FollowUp } from '../entities/follow-up.entity';
import { VisitAttribution } from '../entities/visit-attribution.entity';
import { DiscountApproval } from '../entities/discount-approval.entity';
import { AuditModule } from '../audit/audit.module';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PatientLead, FollowUp, VisitAttribution, DiscountApproval]), AuditModule],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService]
})
export class CrmModule {}
