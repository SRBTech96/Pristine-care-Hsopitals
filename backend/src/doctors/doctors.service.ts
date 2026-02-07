import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { DoctorAvailabilitySlot } from '../entities/doctor-availability-slot.entity';
import { DoctorProfileDto } from './dto/doctor-profile.dto';
import { DoctorAvailabilityResponseDto, AvailabilitySlotDto } from './dto/availability-slot.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private doctorsRepo: Repository<Doctor>,
    @InjectRepository(DoctorAvailabilitySlot) private slotsRepo: Repository<DoctorAvailabilitySlot>
  ) {}

  async findById(id: string): Promise<DoctorProfileDto> {
    const doctor = await this.doctorsRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return this.toDoctorDto(doctor);
  }

  async findByUserId(userId: string): Promise<DoctorProfileDto> {
    const doctor = await this.doctorsRepo.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return this.toDoctorDto(doctor);
  }

  async findByDepartment(departmentId: string): Promise<DoctorProfileDto[]> {
    const doctors = await this.doctorsRepo.find({
      where: { departmentId, isAvailable: true }
    });
    return doctors.map(d => this.toDoctorDto(d));
  }

  async getAvailabilitySlots(doctorId: string): Promise<DoctorAvailabilityResponseDto> {
    const doctor = await this.doctorsRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const slots = await this.slotsRepo.find({
      where: { doctorId, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    return {
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.id}`, // In prod, fetch from users table
      specializationId: doctor.specializationId,
      departmentId: doctor.departmentId,
      consultationFee: doctor.consultationFee,
      slots: slots.map(s => this.toSlotDto(s))
    };
  }

  async getAvailableSlotsForDay(doctorId: string, dayOfWeek: number): Promise<AvailabilitySlotDto[]> {
    const slots = await this.slotsRepo.find({
      where: { doctorId, dayOfWeek, isActive: true }
    });
    return slots.map(s => this.toSlotDto(s));
  }

  private toDoctorDto(doctor: Doctor): DoctorProfileDto {
    return {
      id: doctor.id,
      userId: doctor.userId,
      registrationNumber: doctor.registrationNumber,
      specializationId: doctor.specializationId,
      departmentId: doctor.departmentId,
      qualifications: doctor.qualifications,
      yearsOfExperience: doctor.yearsOfExperience,
      consultationFee: doctor.consultationFee,
      isAvailable: doctor.isAvailable,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };
  }

  private toSlotDto(slot: DoctorAvailabilitySlot): AvailabilitySlotDto {
    return {
      id: slot.id,
      doctorId: slot.doctorId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: slot.slotDurationMinutes,
      isActive: slot.isActive,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt
    };
  }
}
