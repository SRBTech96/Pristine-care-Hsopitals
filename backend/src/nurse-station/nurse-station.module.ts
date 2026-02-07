import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  NurseAssignment,
  InpatientAdmission,
  DoctorOrder,
  MedicationSchedule,
  MedicationAdministration,
  VitalsRecord,
  EmergencyEvent,
  Patient,
  User,
  Ward,
  Bed,
} from '../entities';
import { AuditModule } from '../audit/audit.module';
import { NurseStationService } from './nurse-station.service';
import { NurseStationController } from './nurse-station.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NurseAssignment,
      InpatientAdmission,
      DoctorOrder,
      MedicationSchedule,
      MedicationAdministration,
      VitalsRecord,
      EmergencyEvent,
      Patient,
      User,
      Ward,
      Bed,
    ]),
    AuditModule,
  ],
  controllers: [NurseStationController],
  providers: [NurseStationService],
  exports: [NurseStationService],
})
export class NurseStationModule {}
