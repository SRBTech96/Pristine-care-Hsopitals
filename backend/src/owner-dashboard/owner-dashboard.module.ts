import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerDashboardService } from './owner-dashboard.service';
import { OwnerDashboardController } from './owner-dashboard.controller';
import { RevenueRecord } from '../entities/revenue-record.entity';
import { ExpenseRecord } from '../entities/expense-record.entity';
import { PharmacySale } from '../entities/pharmacy-sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueRecord, ExpenseRecord, PharmacySale])],
  providers: [OwnerDashboardService],
  controllers: [OwnerDashboardController],
})
export class OwnerDashboardModule {}
