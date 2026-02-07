import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from '../src/patients/patients.controller';
import { PatientsService } from '../src/patients/patients.service';
import { AuditService } from '../src/audit/audit.service';

describe('PatientsController', () => {
  let controller: PatientsController;
  let patientsService: Partial<PatientsService>;
  let auditService: Partial<AuditService>;

  beforeEach(async () => {
    patientsService = {
      findById: jest.fn().mockResolvedValue({ id: 'uuid', mrn: 'MRN123', firstName: 'John', lastName: 'Doe', dateOfBirth: new Date(), gender: 'Male', status: 'active' })
    };
    auditService = { logDataAccess: jest.fn(), logAudit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: patientsService },
        { provide: AuditService, useValue: auditService }
      ]
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
  });

  it('should return patient data (sanitized) when authorized', async () => {
    // simulate controller call
    const result = await controller.getPatient({ id: 'uuid' } as any);
    expect(result).toBeDefined();
    expect(result).not.toHaveProperty('nationalId');
    expect(patientsService.findById).toHaveBeenCalledWith('uuid');
  });
});
