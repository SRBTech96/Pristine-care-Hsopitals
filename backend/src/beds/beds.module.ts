import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bed, Ward, RoomCategory, BedStatusHistory, Patient } from '../entities';
import { BedsService } from './beds.service';
import { BedsController } from './beds.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bed, Ward, RoomCategory, BedStatusHistory, Patient]),
    AuditModule,
  ],
  controllers: [BedsController],
  providers: [BedsService],
  exports: [BedsService],
})
export class BedsModule {}
