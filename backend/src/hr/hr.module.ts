import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrEmployee } from '../entities/hr-employee.entity';
import { SalaryStructure } from '../entities/salary-structure.entity';
import { PayrollRecord } from '../entities/payroll-record.entity';
import { HrLeaveRecord } from '../entities/hr-leave-record.entity';
import { HrOfferLetter } from '../entities/hr-offer-letter.entity';
import { AuditModule } from '../audit/audit.module';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrEmployee,
      SalaryStructure,
      PayrollRecord,
      HrLeaveRecord,
      HrOfferLetter,
    ]),
    AuditModule,
  ],
  providers: [HrService],
  controllers: [HrController],
  exports: [HrService],
})
export class HrModule {}
