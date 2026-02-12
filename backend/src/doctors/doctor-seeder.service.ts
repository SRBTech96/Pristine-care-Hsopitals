import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class DoctorSeederService {
  constructor(
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
  ) {}

  /**
   * Seed sample doctors (run once on application startup)
   */
  async seedSampleDoctors(): Promise<void> {
    // Check if sample data already exists
    const count = await this.doctorRepo.count();
    if (count > 0) {
      console.log('Sample doctors already exist, skipping seed');
      return;
    }

    // HM Prasanna - Senior Orthopaedist
    const doc1Data = {
      userId: 'user-1',
      registrationNumber: 'ORG-12345-IN',
      specializationId: 'spec-1',
      departmentId: 'dept-1',
      qualifications: 'MD,DNB Orthopedics,Fellowship in Joint Replacement',
      yearsOfExperience: 18,
    };

    try {
      const doc1 = this.doctorRepo.create(doc1Data);
      await this.doctorRepo.save(doc1);
      console.log('✓ Seeded sample doctor: HM Prasanna');
    } catch (error) {
      console.error('Failed to seed sample doctor:', error);
    }
  }
}
