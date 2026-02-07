import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinanceService } from '../src/finance/finance.service';
import { RevenueRecord } from '../src/entities/revenue-record.entity';
import { ExpenseRecord } from '../src/entities/expense-record.entity';
import { AuditService } from '../src/audit/audit.service';

describe('FinanceService', () => {
  let service: FinanceService;
  let revenueRepo: any;
  let expenseRepo: any;
  let auditService: any;

  const mockUser = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: getRepositoryToken(RevenueRecord),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(ExpenseRecord),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), createQueryBuilder: jest.fn() },
        },
        { provide: AuditService, useValue: { logAccess: jest.fn() } },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    revenueRepo = module.get(getRepositoryToken(RevenueRecord));
    expenseRepo = module.get(getRepositoryToken(ExpenseRecord));
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRevenue', () => {
    it('creates and returns a revenue record', async () => {
      const dto = { amount: 1000, paymentMethod: 'cash' } as any;
      const saved = { id: 'r1', receiptNumber: 'RCPT-1', finalAmount: 1000 } as any;
      revenueRepo.create.mockReturnValue(saved);
      revenueRepo.save.mockResolvedValue(saved);

      const res = await service.createRevenue(dto, mockUser);

      expect(revenueRepo.create).toHaveBeenCalled();
      expect(revenueRepo.save).toHaveBeenCalledWith(saved);
      expect(auditService.logAccess).toHaveBeenCalled();
      expect(res).toEqual(saved);
    });

    it('throws for invalid amount', async () => {
      await expect(service.createRevenue({ amount: 0, paymentMethod: 'cash' } as any, mockUser)).rejects.toThrow();
    });
  });

  describe('createExpense', () => {
    it('creates an expense record', async () => {
      const dto = { category: 'supplies', amount: 500, paymentMethod: 'bank' } as any;
      const saved = { id: 'e1', expenseNumber: 'EXP-1', amount: 500 } as any;
      expenseRepo.create.mockReturnValue(saved);
      expenseRepo.save.mockResolvedValue(saved);

      const res = await service.createExpense(dto, mockUser);

      expect(expenseRepo.create).toHaveBeenCalled();
      expect(expenseRepo.save).toHaveBeenCalledWith(saved);
      expect(auditService.logAccess).toHaveBeenCalled();
      expect(res).toEqual(saved);
    });
  });
});
