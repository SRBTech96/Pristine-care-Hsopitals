import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyInventory } from '../entities/pharmacy-inventory.entity';
import { PharmacyBatch } from '../entities/pharmacy-batch.entity';
import { PharmacyPurchase } from '../entities/pharmacy-purchase.entity';
import { PharmacySale } from '../entities/pharmacy-sale.entity';
import { AuditModule } from '../audit/audit.module';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PharmacyInventory, PharmacyBatch, PharmacyPurchase, PharmacySale]), AuditModule],
  providers: [PharmacyService],
  controllers: [PharmacyController],
  exports: [PharmacyService],
})
export class PharmacyModule {}
