import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientResponseDto } from './dto/patient-response.dto';

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private patientsRepo: Repository<Patient>) {}

  async findById(id: string): Promise<PatientResponseDto> {
    const p = await this.patientsRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Patient not found');

    // Sanitize PII: do not return national_id in API responses
    const out: PatientResponseDto = {
      id: p.id,
      mrn: p.mrn,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      status: p.status
    };
    return out;
  }
}
