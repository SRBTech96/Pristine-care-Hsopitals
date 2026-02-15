import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HrService } from '../src/hr/hr.service';
import { HrEmployee } from '../src/entities/hr-employee.entity';
import { SalaryStructure } from '../src/entities/salary-structure.entity';
import { PayrollRecord } from '../src/entities/payroll-record.entity';
import { HrLeaveRecord } from '../src/entities/hr-leave-record.entity';
import { HrOfferLetter } from '../src/entities/hr-offer-letter.entity';
import { AuditService } from '../src/audit/audit.service';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('HrService', () => {
  let service: HrService;
  let employeeRepository: any;
  let salaryStructureRepository: any;
  let payrollRepository: any;
  let leaveRepository: any;
  let offerLetterRepository: any;
  let auditService: any;
  let dataSource: any;

  const mockUserId = 'user-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        {
          provide: getRepositoryToken(HrEmployee),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SalaryStructure),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PayrollRecord),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HrLeaveRecord),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HrOfferLetter),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logAccess: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HrService>(HrService);
    employeeRepository = module.get(getRepositoryToken(HrEmployee));
    salaryStructureRepository = module.get(getRepositoryToken(SalaryStructure));
    payrollRepository = module.get(getRepositoryToken(PayrollRecord));
    leaveRepository = module.get(getRepositoryToken(HrLeaveRecord));
    offerLetterRepository = module.get(getRepositoryToken(HrOfferLetter));
    auditService = module.get<AuditService>(AuditService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const dto = {
        userId: 'user-456',
        employeeId: 'EMP-001',
        employeeType: 'doctor',
        departmentId: 'dept-123',
        designation: 'General Practitioner',
        dateOfJoining: '2024-01-01',
      };

      const employee = {
        id: 'emp-123',
        ...dto,
        createdBy: mockUserId,
        updatedBy: mockUserId,
      };

      employeeRepository.create.mockReturnValue(employee);
      employeeRepository.save.mockResolvedValue(employee);

      const result = await service.createEmployee(dto, mockUserId);

      expect(result).toEqual(employee);
      expect(employeeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: mockUserId }),
      );
      expect(employeeRepository.save).toHaveBeenCalledWith(employee);
    });
  });

  describe('getEmployee', () => {
    it('should get an employee by id', async () => {
      const employee = {
        id: 'emp-123',
        employeeId: 'EMP-001',
        designation: 'Doctor',
      };

      employeeRepository.findOne.mockResolvedValue(employee);

      const result = await service.getEmployee('emp-123');

      expect(result).toEqual(employee);
      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'emp-123' },
      });
    });

    it('should throw NotFoundException if employee not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.getEmployee('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createSalaryStructure', () => {
    it('should create salary structure for employee', async () => {
      const employee = { id: 'emp-123', employeeId: 'EMP-001' };
      const dto = {
        employeeId: 'emp-123',
        effectiveFrom: '2024-01-01',
        baseSalary: 100000,
        allowances: { house_rent: 10000, medical: 5000 },
        deductions: { pf: 1800 },
      };

      const salary = {
        id: 'sal-123',
        ...dto,
        grossSalary: 115000,
        createdBy: mockUserId,
      };

      employeeRepository.findOne.mockResolvedValue(employee);
      salaryStructureRepository.create.mockReturnValue(salary);
      salaryStructureRepository.save.mockResolvedValue(salary);

      const result = await service.createSalaryStructure(dto, mockUserId);

      expect(result).toEqual(salary);
      expect(salaryStructureRepository.save).toHaveBeenCalledWith(salary);
    });

    it('should throw NotFoundException if employee not found', async () => {
      const dto = {
        employeeId: 'non-existent',
        effectiveFrom: '2024-01-01',
        baseSalary: 100000,
      };

      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.createSalaryStructure(dto, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('processPayroll', () => {
    it('should process monthly payroll', async () => {
      const employee = { id: 'emp-123', employeeId: 'EMP-001' };
      const salaryStructure = {
        id: 'sal-123',
        baseSalary: 100000,
        grossSalary: 115000,
        allowances: { house_rent: 10000 },
        deductions: { pf: 1800 },
      };

      const dto = {
        monthYear: '2024-01-01',
        unpaidLeaveDays: 2,
        deductions: 1800,
        bonusAmount: 5000,
      };

      const payroll = {
        id: 'payroll-123',
        ...dto,
        baseSalary: 100000,
        grossSalary: 115000,
        netSalary: 118200,
        status: 'pending',
        createdBy: mockUserId,
      };

      employeeRepository.findOne.mockResolvedValue(employee);
      salaryStructureRepository.findOne.mockResolvedValue(salaryStructure);
      payrollRepository.findOne.mockResolvedValue(null);
      payrollRepository.create.mockReturnValue(payroll);
      payrollRepository.save.mockResolvedValue(payroll);

      const result = await service.processPayroll('emp-123', dto, mockUserId);

      expect(result.status).toBe('pending');
      expect(payrollRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if payroll already processed', async () => {
      const employee = { id: 'emp-123', employeeId: 'EMP-001' };
      const salaryStructure = { id: 'sal-123', baseSalary: 100000 };
      const existingPayroll = {
        id: 'payroll-123',
        status: 'processed',
      };

      const dto = {
        monthYear: '2024-01-01',
        unpaidLeaveDays: 0,
      };

      employeeRepository.findOne.mockResolvedValue(employee);
      salaryStructureRepository.findOne.mockResolvedValue(salaryStructure);
      payrollRepository.findOne.mockResolvedValue(existingPayroll);

      await expect(
        service.processPayroll('emp-123', dto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createLeaveRequest', () => {
    it('should create a leave request', async () => {
      const employee = {
        id: 'emp-123',
        employeeId: 'EMP-001',
        status: 'active',
      };

      const dto = {
        employeeId: 'emp-123',
        leaveType: 'sick',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        numberOfDays: 3,
        reason: 'Medical checkup',
      };

      const leave = {
        id: 'leave-123',
        ...dto,
        status: 'pending',
        createdBy: mockUserId,
      };

      employeeRepository.findOne.mockResolvedValue(employee);
      leaveRepository.create.mockReturnValue(leave);
      leaveRepository.save.mockResolvedValue(leave);

      const result = await service.createLeaveRequest(dto, mockUserId);

      expect(result.status).toBe('pending');
      expect(leaveRepository.save).toHaveBeenCalledWith(leave);
    });

    it('should throw BadRequestException if employee terminated', async () => {
      const employee = {
        id: 'emp-123',
        employeeId: 'EMP-001',
        status: 'terminated',
      };

      const dto = {
        employeeId: 'emp-123',
        leaveType: 'sick',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        numberOfDays: 3,
      };

      employeeRepository.findOne.mockResolvedValue(employee);

      await expect(
        service.createLeaveRequest(dto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveLeave', () => {
    it('should approve a pending leave request', async () => {
      const leave = {
        id: 'leave-123',
        status: 'pending',
        leaveType: 'sick',
        numberOfDays: 3,
      };

      leaveRepository.findOne.mockResolvedValue(leave);
      leaveRepository.save.mockResolvedValue({
        ...leave,
        status: 'approved',
        approvedBy: mockUserId,
        approvalDate: expect.any(Date),
      });

      const result = await service.approveLeave(
        'leave-123',
        'Approved as requested',
        mockUserId,
      );

      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe(mockUserId);
    });

    it('should throw NotFoundException if leave not found', async () => {
      leaveRepository.findOne.mockResolvedValue(null);

      await expect(
        service.approveLeave('non-existent', 'Approved', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if leave already approved', async () => {
      const leave = {
        id: 'leave-123',
        status: 'approved',
      };

      leaveRepository.findOne.mockResolvedValue(leave);

      await expect(
        service.approveLeave('leave-123', 'Approved', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLeaveBalance', () => {
    it('should calculate leave balance for year', async () => {
      const leave1 = {
        id: 'leave-1',
        leaveType: 'sick',
        numberOfDays: 3,
        status: 'approved',
        startDate: new Date('2024-01-15'),
      };

      const leave2 = {
        id: 'leave-2',
        leaveType: 'casual',
        numberOfDays: 2,
        status: 'approved',
        startDate: new Date('2024-02-10'),
      };

      leaveRepository.find.mockResolvedValue([leave1, leave2]);

      const balance = await service.getLeaveBalance('emp-123', 2024);

      expect(balance.sick).toEqual({ used: 3, remaining: 9 });
      expect(balance.casual).toEqual({ used: 2, remaining: 8 });
      expect(balance.earned).toEqual({ used: 0, remaining: 20 });
    });
  });

  describe('createOfferLetter', () => {
    it('should create an offer letter', async () => {
      const employee = { id: 'emp-123', employeeId: 'EMP-001' };
      const dto = {
        employeeId: 'emp-123',
        offerDate: '2024-01-01',
        designation: 'Senior Doctor',
        departmentId: 'dept-123',
        salary: 150000,
        joiningDate: '2024-02-01',
      };

      const offer = {
        id: 'offer-123',
        ...dto,
        status: 'draft',
        createdBy: mockUserId,
      };

      employeeRepository.findOne.mockResolvedValue(employee);
      offerLetterRepository.create.mockReturnValue(offer);
      offerLetterRepository.save.mockResolvedValue(offer);

      const result = await service.createOfferLetter(dto, mockUserId);

      expect(result.status).toBe('draft');
      expect(offerLetterRepository.save).toHaveBeenCalledWith(offer);
    });
  });

  describe('updateOfferLetterStatus', () => {
    it('should update offer letter status to accepted', async () => {
      const offer = {
        id: 'offer-123',
        status: 'sent',
        designationName: 'Doctor',
      };

      offerLetterRepository.findOne.mockResolvedValue(offer);
      offerLetterRepository.save.mockResolvedValue({
        ...offer,
        status: 'accepted',
        acceptanceDate: expect.any(Date),
      });

      const result = await service.updateOfferLetterStatus(
        'offer-123',
        'accepted',
        mockUserId,
      );

      expect(result.status).toBe('accepted');
      expect(result.acceptanceDate).toBeDefined();
    });

    it('should throw BadRequestException for invalid status', async () => {
      const offer = { id: 'offer-123', status: 'draft' };

      offerLetterRepository.findOne.mockResolvedValue(offer);

      await expect(
        service.updateOfferLetterStatus('offer-123', 'invalid-status', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
