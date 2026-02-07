import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PharmacyService } from '../src/pharmacy/pharmacy.service';
import { PharmacyInventory } from '../src/entities/pharmacy-inventory.entity';
import { PharmacyBatch } from '../src/entities/pharmacy-batch.entity';
import { PharmacyPurchase } from '../src/entities/pharmacy-purchase.entity';
import { PharmacySale } from '../src/entities/pharmacy-sale.entity';
import { AuditService } from '../src/audit/audit.service';

describe('PharmacyService', () => {
  let service: PharmacyService;
  let invRepo: any;
  let batchRepo: any;
  let purchaseRepo: any;
  let saleRepo: any;
  let audit: any;

  const user = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        { provide: getRepositoryToken(PharmacyInventory), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(PharmacyBatch), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(PharmacyPurchase), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(PharmacySale), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: AuditService, useValue: { logAccess: jest.fn() } },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
    invRepo = module.get(getRepositoryToken(PharmacyInventory));
    batchRepo = module.get(getRepositoryToken(PharmacyBatch));
    purchaseRepo = module.get(getRepositoryToken(PharmacyPurchase));
    saleRepo = module.get(getRepositoryToken(PharmacySale));
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('adds inventory item', async () => {
    const dto = { sku: 'DRUG-001', name: 'Paracetamol', unitPrice: 10 } as any;
    const saved = { id: 'i1', ...dto } as any;
    invRepo.findOne.mockResolvedValue(null);
    invRepo.create.mockReturnValue(saved);
    invRepo.save.mockResolvedValue(saved);

    const res = await service.addInventory(dto, user);
    expect(invRepo.create).toHaveBeenCalled();
    expect(invRepo.save).toHaveBeenCalledWith(saved);
    expect(audit.logAccess).toHaveBeenCalled();
    expect(res).toEqual(saved);
  });

  it('creates purchase and updates batch', async () => {
    const batch = { id: 'b1', quantity: 10 } as any;
    batchRepo.findOne.mockResolvedValue(batch);
    batchRepo.save.mockResolvedValue({ ...batch, quantity: 20 });
    purchaseRepo.create.mockReturnValue({ id: 'p1' });
    purchaseRepo.save.mockResolvedValue({ id: 'p1' });

    const res = await service.purchaseStock({ inventoryId: 'i1', batchId: 'b1', quantity: 10, unitCost: 5 } as any, user);
    expect(batchRepo.save).toHaveBeenCalled();
    expect(purchaseRepo.save).toHaveBeenCalled();
    expect(audit.logAccess).toHaveBeenCalled();
  });

  it('sells medication and decreases batch', async () => {
    const inv = { id: 'i1' } as any;
    const batch = { id: 'b1', quantity: 5, expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24) } as any;
    invRepo.findOne.mockResolvedValue(inv);
    batchRepo.findOne.mockResolvedValue(batch);
    batchRepo.save.mockResolvedValue({ ...batch, quantity: 2 });
    saleRepo.create.mockReturnValue({ id: 's1' });
    saleRepo.save.mockResolvedValue({ id: 's1' });

    const res = await service.sellMedication({ inventoryId: 'i1', batchId: 'b1', quantity: 3, unitPrice: 10, paymentMethod: 'cash' } as any, user);
    expect(batchRepo.save).toHaveBeenCalled();
    expect(saleRepo.save).toHaveBeenCalled();
    expect(audit.logAccess).toHaveBeenCalled();
  });
});
