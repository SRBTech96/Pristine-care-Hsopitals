import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto, CancelAppointmentDto } from './dto/update-appointment.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AppointmentsService {
  constructor(@InjectRepository(Appointment) private appointmentsRepo: Repository<Appointment>) {}

  async findById(id: string): Promise<AppointmentResponseDto> {
    const a = await this.appointmentsRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Appointment not found');
    return this.toDto(a);
  }

  async create(dto: CreateAppointmentDto, userId: string): Promise<AppointmentResponseDto> {
    const appointmentNumber = `APT-${Date.now()}-${uuid().substring(0, 8)}`;
    const a = this.appointmentsRepo.create({
      appointmentNumber,
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      departmentId: dto.departmentId,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes,
      reasonForVisit: dto.reasonForVisit,
      status: 'scheduled',
      createdBy: userId,
      version: 1
    });
    const saved = await this.appointmentsRepo.save(a);
    return this.toDto(saved);
  }

  async updateConsultationNotes(id: string, dto: UpdateAppointmentDto, userId: string): Promise<AppointmentResponseDto> {
    const a = await this.appointmentsRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Appointment not found');

    // Optimistic locking: check version
    if (dto.version && a.version !== dto.version) {
      throw new ConflictException('Appointment was modified; please refresh and try again');
    }

    a.consultationNotes = dto.consultationNotes || a.consultationNotes;
    a.updatedBy = userId;
    a.version += 1;
    a.updatedAt = new Date();

    const saved = await this.appointmentsRepo.save(a);
    return this.toDto(saved);
  }

  async cancel(id: string, dto: CancelAppointmentDto, userId: string): Promise<AppointmentResponseDto> {
    const a = await this.appointmentsRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Appointment not found');

    // Optimistic locking
    if (a.version !== dto.version) {
      throw new ConflictException('Appointment was modified; please refresh and try again');
    }

    if (a.status === 'cancelled') {
      throw new ConflictException('Appointment already cancelled');
    }

    a.status = 'cancelled';
    a.cancelledBy = userId;
    a.cancelledAt = new Date();
    a.cancellationReason = dto.cancellationReason;
    a.version += 1;
    a.updatedBy = userId;
    a.updatedAt = new Date();

    const saved = await this.appointmentsRepo.save(a);
    return this.toDto(saved);
  }

  private toDto(a: Appointment): AppointmentResponseDto {
    return {
      id: a.id,
      appointmentNumber: a.appointmentNumber,
      patientId: a.patientId,
      doctorId: a.doctorId,
      departmentId: a.departmentId,
      scheduledAt: a.scheduledAt,
      durationMinutes: a.durationMinutes,
      status: a.status,
      roomNumber: a.roomNumber,
      reasonForVisit: a.reasonForVisit,
      consultationNotes: a.consultationNotes,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      version: a.version
    };
  }
}
