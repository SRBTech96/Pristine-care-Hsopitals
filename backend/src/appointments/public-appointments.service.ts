import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientLead } from '../entities/patient-lead.entity';
import { PublicAppointmentRequestDto } from './dto/public-appointment-request.dto';

@Injectable()
export class PublicAppointmentsService {
  constructor(@InjectRepository(PatientLead) private leadsRepo: Repository<PatientLead>) {}

  async createRequest(dto: PublicAppointmentRequestDto) {
    const createdBy = process.env.PUBLIC_REQUEST_USER_ID || '00000000-0000-0000-0000-000000000000';

    const notes = [
      `DepartmentId: ${dto.departmentId}`,
      `DoctorId: ${dto.doctorId}`,
      `RequestedDate: ${dto.requestedDate}`,
      `RequestedTime: ${dto.requestedTime}`,
      dto.reasonForVisit ? `Reason: ${dto.reasonForVisit}` : undefined
    ].filter(Boolean).join(' | ');

    const lead = this.leadsRepo.create({
      name: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      source: 'website',
      status: 'new',
      interestedIn: 'appointment',
      notes,
      createdBy
    });

    const saved = await this.leadsRepo.save(lead);

    // Placeholder notifications (no provider configured)
    console.log('[PublicAppointments] Request received', {
      requestId: saved.id,
      phone: dto.phone,
      email: dto.email
    });

    return {
      requestId: saved.id,
      status: saved.status,
      message: 'Appointment request received. Our staff will confirm shortly.'
    };
  }
}
