import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OwnerDashboardService } from '../src/owner-dashboard/owner-dashboard.service';
import { RevenueRecord } from '../src/entities/revenue-record.entity';
import { ExpenseRecord } from '../src/entities/expense-record.entity';
import { PharmacySale } from '../src/entities/pharmacy-sale.entity';

describe('OwnerDashboardService', () => {
  let service: OwnerDashboardService;
  let revRepo: any;
  let expRepo: any;
  let saleRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerDashboardService,
        { provide: getRepositoryToken(RevenueRecord), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(ExpenseRecord), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(PharmacySale), useValue: { createQueryBuilder: jest.fn() } },
      ],
    }).compile();

    service = module.get<OwnerDashboardService>(OwnerDashboardService);
    revRepo = module.get(getRepositoryToken(RevenueRecord));
    expRepo = module.get(getRepositoryToken(ExpenseRecord));
    saleRepo = module.get(getRepositoryToken(PharmacySale));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
