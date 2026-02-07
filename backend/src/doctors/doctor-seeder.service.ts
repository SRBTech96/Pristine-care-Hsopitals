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
    const doc1 = this.doctorRepo.create({
      firstName: 'HM',
      lastName: 'Prasanna',
      email: 'hm.prasanna@pristinehospital.com',
      phone: '+91-9876543210',
      qualifications: ['MD', 'DNB Orthopedics', 'Fellowship in Joint Replacement'],
      specialization: 'Orthopedics',
      yearsOfExperience: 18,
      registrationNumber: 'ORG-12345-IN',
      bio: 'Senior Orthopaedist with 18 years of specialized experience in trauma, joint replacement surgery, and sports medicine. Successfully performed 5000+ surgeries with 98% patient satisfaction.',
    });

    try {
      await this.doctorRepo.save(doc1);
      console.log('✓ Seeded sample doctor: HM Prasanna');
    } catch (error) {
      console.error('Failed to seed sample doctor:', error);
    }
  }
}
