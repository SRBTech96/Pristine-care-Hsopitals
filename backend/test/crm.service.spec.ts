import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CrmService } from '../src/crm/crm.service';
import { PatientLead } from '../src/entities/patient-lead.entity';
import { FollowUp } from '../src/entities/follow-up.entity';
import { VisitAttribution } from '../src/entities/visit-attribution.entity';
import { DiscountApproval } from '../src/entities/discount-approval.entity';

describe('CrmService', () => {
  let service: CrmService;
  let leadsMock: any;
  let followUpsMock: any;
  let visitMock: any;
  let discountMock: any;

  beforeEach(async () => {
    leadsMock = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), createQueryBuilder: jest.fn() };
    followUpsMock = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() };
    visitMock = { create: jest.fn(), save: jest.fn(), find: jest.fn() };
    discountMock = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        { provide: getRepositoryToken(PatientLead), useValue: leadsMock },
        { provide: getRepositoryToken(FollowUp), useValue: followUpsMock },
        { provide: getRepositoryToken(VisitAttribution), useValue: visitMock },
        { provide: getRepositoryToken(DiscountApproval), useValue: discountMock }
      ]
    }).compile();

    service = module.get<CrmService>(CrmService);
  });

  describe('createLead', () => {
    it('should create a patient lead', async () => {
      const mockLead = {
        id: 'lead-1',
        name: 'John Doe',
        phone: '+919123456789',
        email: 'john@example.com',
        source: 'website',
        status: 'new',
        interestedIn: 'Cardiology',
        notes: 'Interested in consultation',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      leadsMock.create.mockReturnValue(mockLead);
      leadsMock.save.mockResolvedValue(mockLead);

      const result = await service.createLead(
        { name: 'John Doe', phone: '+919123456789', email: 'john@example.com', source: 'website', interestedIn: 'Cardiology' },
        'user-1'
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(leadsMock.create).toHaveBeenCalled();
    });
  });

  describe('getLead', () => {
    it('should return lead when found', async () => {
      const mockLead = {
        id: 'lead-1',
        name: 'Jane Doe',
        status: 'qualified',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      leadsMock.findOne.mockResolvedValue(mockLead);
      const result = await service.getLead('lead-1');
      expect(result).toBeDefined();
      expect(result.name).toBe('Jane Doe');
    });

    it('should throw NotFoundException when lead not found', async () => {
      leadsMock.findOne.mockResolvedValue(null);
      await expect(service.getLead('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveDiscount', () => {
    it('should approve discount when user is ADMIN', async () => {
      const mockDiscount = {
        id: 'disc-1',
        targetType: 'appointment',
        targetId: 'apt-1',
        discountPercentage: 10,
        reason: 'Senior citizen',
        approvedBy: 'admin-1',
        approvalDate: new Date(),
        status: 'approved',
        createdAt: new Date()
      };

      discountMock.create.mockReturnValue(mockDiscount);
      discountMock.save.mockResolvedValue(mockDiscount);

      const result = await service.approveDiscount(
        { targetType: 'appointment', targetId: 'apt-1', discountPercentage: 10, reason: 'Senior citizen' },
        'admin-1',
        'ADMIN'
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe('admin-1');
    });

    it('should throw ForbiddenException when user is not ADMIN', async () => {
      await expect(
        service.approveDiscount(
          { targetType: 'appointment', targetId: 'apt-1', discountPercentage: 10 },
          'staff-1',
          'STAFF'
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createFollowUp', () => {
    it('should create follow-up for a lead', async () => {
      const mockLead = { id: 'lead-1', name: 'John Doe' };
      const mockFollowUp = {
        id: 'fu-1',
        leadId: 'lead-1',
        followUpType: 'call',
        status: 'pending',
        scheduledDate: new Date(),
        createdAt: new Date()
      };

      leadsMock.findOne.mockResolvedValue(mockLead);
      followUpsMock.create.mockReturnValue(mockFollowUp);
      followUpsMock.save.mockResolvedValue(mockFollowUp);

      const result = await service.createFollowUp(
        { leadId: 'lead-1', scheduledDate: new Date().toISOString(), followUpType: 'call' },
        'user-1'
      );

      expect(result).toBeDefined();
      expect(result.followUpType).toBe('call');
    });

    it('should throw NotFoundException when lead not found', async () => {
      leadsMock.findOne.mockResolvedValue(null);
      await expect(
        service.createFollowUp(
          { leadId: 'invalid-lead', scheduledDate: new Date().toISOString(), followUpType: 'call' },
          'user-1'
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
