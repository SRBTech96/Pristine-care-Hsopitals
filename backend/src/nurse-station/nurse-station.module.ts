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
  NurseAlert,
  NurseTask,
  NursingNote,
  NurseQualityMetric,
  ShiftHandover,
} from '../entities';
import { AuditModule } from '../audit/audit.module';
import { NurseStationService } from './nurse-station.service';
import { NurseStationController } from './nurse-station.controller';
import { NurseAlertService } from '../services/NurseAlertService';
import { NurseTaskService } from '../services/NurseTaskService';
import { NursingNoteService } from '../services/NursingNoteService';
import { QualityMetricsService } from '../services/QualityMetricsService';
import { ShiftHandoverService } from '../services/ShiftHandoverService';
import { NurseAlertController } from '../controllers/NurseAlertController';
import { NurseTaskController } from '../controllers/NurseTaskController';
import { NursingNoteController } from '../controllers/NursingNoteController';
import { QualityMetricsController } from '../controllers/QualityMetricsController';
import { ShiftHandoverController } from '../controllers/ShiftHandoverController';

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
      NurseAlert,
      NurseTask,
      NursingNote,
      NurseQualityMetric,
      ShiftHandover,
    ]),
    AuditModule,
  ],
  controllers: [NurseStationController, NurseAlertController, NurseTaskController, NursingNoteController, QualityMetricsController, ShiftHandoverController],
  providers: [NurseStationService, NurseAlertService, NurseTaskService, NursingNoteService, QualityMetricsService, ShiftHandoverService],
  exports: [NurseStationService],
})
export class NurseStationModule {}
