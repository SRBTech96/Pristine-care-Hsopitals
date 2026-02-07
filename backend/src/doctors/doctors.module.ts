import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../entities/doctor.entity';
import { DoctorAvailabilitySlot } from '../entities/doctor-availability-slot.entity';
import { AuditModule } from '../audit/audit.module';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, DoctorAvailabilitySlot]), AuditModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService]
})
export class DoctorsModule {}
