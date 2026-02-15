import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities/appointment.entity';
import { PatientLead } from '../entities/patient-lead.entity';
import { AuditModule } from '../audit/audit.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PublicAppointmentsController } from './public-appointments.controller';
import { PublicAppointmentsService } from './public-appointments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, PatientLead]), AuditModule],
  controllers: [AppointmentsController, PublicAppointmentsController],
  providers: [AppointmentsService, PublicAppointmentsService],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}
