import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { DoctorAvailabilitySlot } from '../entities/doctor-availability-slot.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Specialization } from '../entities/specialization.entity';
import { DoctorProfileDto } from './dto/doctor-profile.dto';
import { DoctorAvailabilityResponseDto, AvailabilitySlotDto } from './dto/availability-slot.dto';
import { PublicDoctorDto } from './dto/public-doctor.dto';

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

  async listPublicDoctors(filter: { departmentId?: string; specializationId?: string } = {}): Promise<PublicDoctorDto[]> {
    const qb = this.doctorsRepo.createQueryBuilder('d')
      .innerJoin(User, 'u', 'u.id = d.userId')
      .innerJoin(Department, 'dept', 'dept.id = d.departmentId')
      .innerJoin(Specialization, 'spec', 'spec.id = d.specializationId')
      .select([
        'd.id AS id',
        'u.first_name AS first_name',
        'u.last_name AS last_name',
        'u.email AS email',
        'u.phone AS phone',
        'd.department_id AS department_id',
        'dept.name AS department_name',
        'd.specialization_id AS specialization_id',
        'spec.name AS specialization_name',
        'd.years_of_experience AS years_of_experience',
        'd.consultation_fee AS consultation_fee',
        'd.is_available AS is_available'
      ])
      .where('d.is_available = :isAvailable', { isAvailable: true });

    if (filter.departmentId) {
      qb.andWhere('d.department_id = :departmentId', { departmentId: filter.departmentId });
    }

    if (filter.specializationId) {
      qb.andWhere('d.specialization_id = :specializationId', { specializationId: filter.specializationId });
    }

    const rows = await qb.orderBy('u.last_name', 'ASC').getRawMany();
    return rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      departmentId: row.department_id,
      departmentName: row.department_name,
      specializationId: row.specialization_id,
      specializationName: row.specialization_name,
      yearsOfExperience: Number(row.years_of_experience),
      consultationFee: row.consultation_fee !== null ? Number(row.consultation_fee) : undefined,
      isAvailable: row.is_available === true || row.is_available === 'true'
    }));
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
