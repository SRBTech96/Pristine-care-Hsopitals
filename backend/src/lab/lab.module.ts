import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTest } from '../entities/lab-test.entity';
import { LabOrder } from '../entities/lab-order.entity';
import { LabSample } from '../entities/lab-sample.entity';
import { LabReport } from '../entities/lab-report.entity';
import { AuditModule } from '../audit/audit.module';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabTest, LabOrder, LabSample, LabReport]), AuditModule],
  providers: [LabService],
  controllers: [LabController],
  exports: [LabService],
})
export class LabModule {}
