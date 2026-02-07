import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PharmacyService } from './pharmacy.service';
import { CreateInventoryDto } from './dto/inventory.dto';
import { CreateBatchDto } from './dto/batch.dto';
import { CreatePurchaseDto } from './dto/purchase.dto';
import { CreateSaleDto } from './dto/sale.dto';

@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private svc: PharmacyService) {}

  @Post('inventory')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_CREATE_INVENTORY')
  async addInventory(@Body() dto: CreateInventoryDto, @CurrentUser() user: any) {
    return this.svc.addInventory(dto, user.id);
  }

  @Post('batches')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_CREATE_BATCH')
  async createBatch(@Body() dto: CreateBatchDto, @CurrentUser() user: any) {
    return this.svc.createBatch(dto, user.id);
  }

  @Post('purchases')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_CREATE_PURCHASE')
  async purchaseStock(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any) {
    return this.svc.purchaseStock(dto, user.id);
  }

  @Post('sales')
  @Roles('ADMIN', 'PHARMACY', 'CASHIER')
  @Auditable('PHARMACY_CREATE_SALE')
  async sellMedication(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.svc.sellMedication(dto, user.id);
  }

  @Get('batches/expiring')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_LIST_EXPIRING')
  async expiring(@Query('days') days?: string) {
    const d = days ? parseInt(days) : 30;
    return this.svc.listBatchesExpiringWithin(d);
  }

  @Get('inventory')
  @Roles('ADMIN', 'PHARMACY')
  @Auditable('PHARMACY_LIST_INVENTORY')
  async listInventory() {
    return this.svc.listInventory();
  }
}
