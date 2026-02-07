import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LabService } from '../src/lab/lab.service';
import { LabTest } from '../src/entities/lab-test.entity';
import { LabOrder } from '../src/entities/lab-order.entity';
import { LabSample } from '../src/entities/lab-sample.entity';
import { LabReport } from '../src/entities/lab-report.entity';
import { AuditService } from '../src/audit/audit.service';

describe('LabService', () => {
  let service: LabService;
  let testRepo: any;
  let orderRepo: any;
  let sampleRepo: any;
  let reportRepo: any;
  let audit: any;

  const user = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabService,
        { provide: getRepositoryToken(LabTest), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(LabOrder), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(LabSample), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(LabReport), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: AuditService, useValue: { logAccess: jest.fn() } },
      ],
    }).compile();

    service = module.get<LabService>(LabService);
    testRepo = module.get(getRepositoryToken(LabTest));
    orderRepo = module.get(getRepositoryToken(LabOrder));
    sampleRepo = module.get(getRepositoryToken(LabSample));
    reportRepo = module.get(getRepositoryToken(LabReport));
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('adds lab test', async () => {
    const dto = { testCode: 'CBC', testName: 'Complete Blood Count', sampleType: 'blood', turnaroundTimeHours: 24, cost: 500 } as any;
    const saved = { id: 't1', ...dto } as any;
    testRepo.create.mockReturnValue(saved);
    testRepo.save.mockResolvedValue(saved);

    const res = await service.addLabTest(dto, user);
    expect(testRepo.create).toHaveBeenCalled();
    expect(testRepo.save).toHaveBeenCalledWith(saved);
    expect(audit.logAccess).toHaveBeenCalled();
    expect(res).toEqual(saved);
  });

  it('creates lab order', async () => {
    const testObj = { id: 't1', testCode: 'CBC' } as any;
    const dto = { patientId: 'p1', testId: 't1', requiredDate: '2024-02-10' } as any;
    const saved = { id: 'o1', orderNumber: 'ORD-1' } as any;
    testRepo.findOne.mockResolvedValue(testObj);
    orderRepo.create.mockReturnValue(saved);
    orderRepo.save.mockResolvedValue(saved);

    const res = await service.createOrder(dto, user);
    expect(orderRepo.create).toHaveBeenCalled();
    expect(orderRepo.save).toHaveBeenCalledWith(saved);
    expect(audit.logAccess).toHaveBeenCalled();
  });

  it('collects sample and updates order status', async () => {
    const order = { id: 'o1', status: 'pending' } as any;
    const dto = { orderId: 'o1', collectionDate: '2024-02-08' } as any;
    const saved = { id: 's1', sampleCode: 'SAMP-1' } as any;
    orderRepo.findOne.mockResolvedValue(order);
    sampleRepo.create.mockReturnValue(saved);
    sampleRepo.save.mockResolvedValue(saved);
    orderRepo.save.mockResolvedValue({ ...order, status: 'sample_collected' });

    const res = await service.collectSample(dto, user);
    expect(sampleRepo.save).toHaveBeenCalledWith(saved);
    expect(orderRepo.save).toHaveBeenCalled();
    expect(audit.logAccess).toHaveBeenCalled();
  });

  it('publishes lab report', async () => {
    const order = { id: 'o1', status: 'sample_collected' } as any;
    const dto = { orderId: 'o1', results: '{"value": "normal"}' } as any;
    const saved = { id: 'r1', reportNumber: 'RPT-1', status: 'draft' } as any;
    orderRepo.findOne.mockResolvedValue(order);
    reportRepo.create.mockReturnValue(saved);
    reportRepo.save.mockResolvedValue(saved);
    orderRepo.save.mockResolvedValue({ ...order, status: 'processing' });

    const res = await service.publishReport(dto, user);
    expect(reportRepo.save).toHaveBeenCalledWith(saved);
    expect(orderRepo.save).toHaveBeenCalled();
  });
});
