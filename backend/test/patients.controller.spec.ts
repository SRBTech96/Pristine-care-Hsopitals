import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from '../src/patients/patients.controller';
import { PatientsService } from '../src/patients/patients.service';
import { AuditService } from '../src/audit/audit.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { OwnershipGuard } from '../src/auth/guards/ownership.guard';

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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(OwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

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
