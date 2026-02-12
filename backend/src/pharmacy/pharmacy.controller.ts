import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PharmacyService } from './pharmacy.service';
import { CreateInventoryDto, InventoryResponseDto } from './dto/inventory.dto';
import { CreateBatchDto, BatchResponseDto } from './dto/batch.dto';
import { CreatePurchaseDto, PurchaseResponseDto } from './dto/purchase.dto';
import { CreateSaleDto, SaleResponseDto } from './dto/sale.dto';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private svc: PharmacyService) {}

  @Post('inventory')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_CREATE_INVENTORY')
  @ApiOperation({ summary: 'Add inventory item' })
  @ApiResponse({ status: 201, type: InventoryResponseDto })
  async addInventory(@Body() dto: CreateInventoryDto, @CurrentUser() user: any): Promise<InventoryResponseDto> {
    const entity = await this.svc.addInventory(dto, user.id);
    return { id: entity.id, sku: entity.sku, name: entity.name, unitPrice: Number(entity.unitPrice) };
  }

  @Post('batches')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_CREATE_BATCH')
  @ApiOperation({ summary: 'Create batch' })
  @ApiResponse({ status: 201, type: BatchResponseDto })
  async createBatch(@Body() dto: CreateBatchDto, @CurrentUser() user: any): Promise<BatchResponseDto> {
    const entity = await this.svc.createBatch(dto, user.id);
    return { id: entity.id, inventoryId: entity.inventoryId, batchNumber: entity.batchNumber, expiryDate: entity.expiryDate, quantity: entity.quantity };
  }

  @Post('purchases')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_CREATE_PURCHASE')
  @ApiOperation({ summary: 'Purchase stock' })
  @ApiResponse({ status: 201, type: PurchaseResponseDto })
  async purchaseStock(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any): Promise<PurchaseResponseDto> {
    const entity = await this.svc.purchaseStock(dto, user.id);
    return { id: entity.id, purchaseNumber: entity.purchaseNumber, inventoryId: entity.inventoryId, batchId: entity.batchId, quantity: entity.quantity, totalCost: Number(entity.totalCost) };
  }

  @Post('sales')
  @Roles('ADMIN', 'PHARMACY', 'CASHIER')
  @Auditable('PHARMACY_CREATE_SALE')
  @ApiOperation({ summary: 'Sell medication' })
  @ApiResponse({ status: 201, type: SaleResponseDto })
  async sellMedication(@Body() dto: CreateSaleDto, @CurrentUser() user: any): Promise<SaleResponseDto> {
    const entity = await this.svc.sellMedication(dto, user.id);
    return {
      id: entity.id,
      invoiceNumber: entity.invoiceNumber,
      inventoryId: entity.inventoryId,
      batchId: entity.batchId ?? undefined,
      quantity: entity.quantity,
      finalAmount: Number(entity.finalAmount),
      paymentMethod: entity.paymentMethod,
      saleDate: entity.saleDate,
    };
  }

  @Get('batches/expiring')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_LIST_EXPIRING')
  @ApiOperation({ summary: 'List batches expiring within N days' })
  @ApiResponse({ status: 200, type: [BatchResponseDto] })
  async expiring(@Query('days') days?: string): Promise<BatchResponseDto[]> {
    const d = days ? parseInt(days) : 30;
    const batches = await this.svc.listBatchesExpiringWithin(d);
    return batches.map(entity => ({
      id: entity.id,
      inventoryId: entity.inventoryId,
      batchNumber: entity.batchNumber,
      expiryDate: entity.expiryDate,
      quantity: entity.quantity,
    }));
  }

  @Get('inventory')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_LIST_INVENTORY')
  @ApiOperation({ summary: 'List inventory' })
  @ApiResponse({ status: 200, type: [InventoryResponseDto] })
  async listInventory(): Promise<InventoryResponseDto[]> {
    const items = await this.svc.listInventory();
    return items.map(entity => ({
      id: entity.id,
      sku: entity.sku,
      name: entity.name,
      unitPrice: Number(entity.unitPrice),
    }));
  }
}
