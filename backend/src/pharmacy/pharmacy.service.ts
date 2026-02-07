import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PharmacyInventory } from '../entities/pharmacy-inventory.entity';
import { PharmacyBatch } from '../entities/pharmacy-batch.entity';
import { PharmacyPurchase } from '../entities/pharmacy-purchase.entity';
import { PharmacySale } from '../entities/pharmacy-sale.entity';
import { CreateInventoryDto } from './dto/inventory.dto';
import { CreateBatchDto } from './dto/batch.dto';
import { CreatePurchaseDto } from './dto/purchase.dto';
import { CreateSaleDto } from './dto/sale.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(PharmacyInventory)
    private inventoryRepo: Repository<PharmacyInventory>,
    @InjectRepository(PharmacyBatch)
    private batchRepo: Repository<PharmacyBatch>,
    @InjectRepository(PharmacyPurchase)
    private purchaseRepo: Repository<PharmacyPurchase>,
    @InjectRepository(PharmacySale)
    private saleRepo: Repository<PharmacySale>,
    private auditService: AuditService,
  ) {}

  // Inventory
  async addInventory(dto: CreateInventoryDto, userId: string): Promise<PharmacyInventory> {
    const existing = await this.inventoryRepo.findOne({ where: { sku: dto.sku } });
    if (existing) throw new BadRequestException('SKU already exists');
    const item = this.inventoryRepo.create({ ...dto, createdBy: userId });
    const saved = await this.inventoryRepo.save(item);
    await this.auditService.logAccess({ action: 'PHARMACY_CREATE_INVENTORY', resourceType: 'PharmacyInventory', resourceId: saved.id, userId, details: { sku: saved.sku } });
    return saved;
  }

  async getInventory(id: string): Promise<PharmacyInventory> {
    const it = await this.inventoryRepo.findOne({ where: { id } });
    if (!it) throw new NotFoundException('Inventory item not found');
    return it;
  }

  // Batches and Purchases
  async createBatch(dto: CreateBatchDto, userId: string): Promise<PharmacyBatch> {
    const inv = await this.getInventory(dto.inventoryId);
    const batch = this.batchRepo.create({
      inventoryId: dto.inventoryId,
      batchNumber: dto.batchNumber,
      expiryDate: new Date(dto.expiryDate),
      quantity: dto.quantity,
      costPrice: dto.costPrice,
      createdBy: userId,
    });
    const saved = await this.batchRepo.save(batch);
    await this.auditService.logAccess({ action: 'PHARMACY_CREATE_BATCH', resourceType: 'PharmacyBatch', resourceId: saved.id, userId, details: { batchNumber: saved.batchNumber } });
    return saved;
  }

  async purchaseStock(dto: CreatePurchaseDto, userId: string): Promise<PharmacyPurchase> {
    const batch = await this.batchRepo.findOne({ where: { id: dto.batchId } });
    if (!batch) throw new NotFoundException('Batch not found');
    // increase batch quantity
    batch.quantity = batch.quantity + dto.quantity;
    await this.batchRepo.save(batch);

    const purchaseNumber = `PUR-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const totalCost = Number((dto.unitCost * dto.quantity).toFixed(2));
    const purchase = this.purchaseRepo.create({
      purchaseNumber,
      inventoryId: dto.inventoryId,
      batchId: dto.batchId,
      quantity: dto.quantity,
      unitCost: dto.unitCost,
      totalCost,
      vendor: dto.vendor,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
      createdBy: userId,
    });

    const saved = await this.purchaseRepo.save(purchase);
    await this.auditService.logAccess({ action: 'PHARMACY_CREATE_PURCHASE', resourceType: 'PharmacyPurchase', resourceId: saved.id, userId, details: { purchaseNumber: saved.purchaseNumber, totalCost: saved.totalCost } });
    return saved;
  }

  // Sales
  async sellMedication(dto: CreateSaleDto, userId: string): Promise<PharmacySale> {
    const inv = await this.inventoryRepo.findOne({ where: { id: dto.inventoryId } });
    if (!inv) throw new NotFoundException('Inventory item not found');

    // if batch provided, decrease batch qty
    if (dto.batchId) {
      const batch = await this.batchRepo.findOne({ where: { id: dto.batchId } });
      if (!batch) throw new NotFoundException('Batch not found');
      if (batch.expiryDate <= new Date()) throw new BadRequestException('Batch expired');
      if (batch.quantity < dto.quantity) throw new BadRequestException('Insufficient stock in batch');
      batch.quantity = batch.quantity - dto.quantity;
      await this.batchRepo.save(batch);
    } else {
      // TODO: allocation across batches could be implemented later
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const amount = Number((dto.unitPrice * dto.quantity).toFixed(2));
    const finalAmount = Number((amount - (dto.discountAmount || 0)).toFixed(2));

    const sale = this.saleRepo.create({
      invoiceNumber,
      inventoryId: dto.inventoryId,
      batchId: dto.batchId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      amount,
      discountAmount: dto.discountAmount || 0,
      finalAmount,
      prescriptionId: dto.prescriptionId,
      appointmentId: dto.appointmentId,
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      paymentMethod: dto.paymentMethod,
      paymentReference: dto.paymentReference,
      createdBy: userId,
    });

    const saved = await this.saleRepo.save(sale);
    await this.auditService.logAccess({ action: 'PHARMACY_CREATE_SALE', resourceType: 'PharmacySale', resourceId: saved.id, userId, details: { invoiceNumber: saved.invoiceNumber, finalAmount: saved.finalAmount } });
    return saved;
  }

  async listBatchesExpiringWithin(days = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    return this.batchRepo.createQueryBuilder('b')
      .where('b.expiryDate <= :threshold', { threshold })
      .orderBy('b.expiryDate', 'ASC')
      .getMany();
  }

  async listInventory(): Promise<PharmacyInventory[]> {
    return this.inventoryRepo.find();
  }
}
