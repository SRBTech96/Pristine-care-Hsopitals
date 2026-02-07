import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueRecord } from '../entities/revenue-record.entity';
import { ExpenseRecord } from '../entities/expense-record.entity';
import { AuditModule } from '../audit/audit.module';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueRecord, ExpenseRecord]), AuditModule],
  providers: [FinanceService],
  controllers: [FinanceController],
  exports: [FinanceService],
})
export class FinanceModule {}
