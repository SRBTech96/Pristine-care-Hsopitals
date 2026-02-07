import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DoctorsService } from '../src/doctors/doctors.service';
import { Doctor } from '../src/entities/doctor.entity';
import { DoctorAvailabilitySlot } from '../src/entities/doctor-availability-slot.entity';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let doctorsMock: any;
  let slotsMock: any;

  beforeEach(async () => {
    doctorsMock = {
      findOne: jest.fn(),
      find: jest.fn()
    };

    slotsMock = {
      findOne: jest.fn(),
      find: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        { provide: getRepositoryToken(Doctor), useValue: doctorsMock },
        { provide: getRepositoryToken(DoctorAvailabilitySlot), useValue: slotsMock }
      ]
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
  });

  describe('findById', () => {
    it('should return doctor profile when found', async () => {
      const mockDoctor = {
        id: 'doc-1',
        userId: 'user-1',
        registrationNumber: 'REG123',
        specializationId: 'spec-1',
        departmentId: 'dept-1',
        qualifications: 'MD, MBBS',
        yearsOfExperience: 10,
        consultationFee: 500,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      doctorsMock.findOne.mockResolvedValue(mockDoctor);

      const result = await service.findById('doc-1');
      expect(result).toBeDefined();
      expect(result.registrationNumber).toBe('REG123');
      expect(doctorsMock.findOne).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
    });

    it('should throw NotFoundException when doctor not found', async () => {
      doctorsMock.findOne.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailabilitySlots', () => {
    it('should return doctor availability with slots', async () => {
      const mockDoctor = {
        id: 'doc-1',
        userId: 'user-1',
        registrationNumber: 'REG123',
        specializationId: 'spec-1',
        departmentId: 'dept-1',
        consultationFee: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSlots = [
        {
          id: 'slot-1',
          doctorId: 'doc-1',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      doctorsMock.findOne.mockResolvedValue(mockDoctor);
      slotsMock.find.mockResolvedValue(mockSlots);

      const result = await service.getAvailabilitySlots('doc-1');
      expect(result).toBeDefined();
      expect(result.doctorId).toBe('doc-1');
      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].dayOfWeek).toBe(1);
    });
  });

  describe('findByDepartment', () => {
    it('should return list of available doctors in department', async () => {
      const mockDoctors = [
        {
          id: 'doc-1',
          registrationNumber: 'REG123',
          departmentId: 'dept-1',
          isAvailable: true,
          userId: 'user-1',
          specializationId: 'spec-1',
          qualifications: 'MD',
          yearsOfExperience: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'doc-2',
          registrationNumber: 'REG124',
          departmentId: 'dept-1',
          isAvailable: true,
          userId: 'user-2',
          specializationId: 'spec-2',
          qualifications: 'MD, PHD',
          yearsOfExperience: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      doctorsMock.find.mockResolvedValue(mockDoctors);

      const result = await service.findByDepartment('dept-1');
      expect(result).toHaveLength(2);
      expect(result[0].registrationNumber).toBe('REG123');
    });
  });
});
