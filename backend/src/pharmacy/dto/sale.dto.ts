import { IsUUID, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateSaleDto {
  @IsUUID()
  inventoryId!: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsString()
  @IsEnum(['cash','bank','upi','card'])
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class SaleResponseDto {
  id!: string;
  invoiceNumber!: string;
  inventoryId!: string;
  batchId?: string;
  quantity!: number;
  finalAmount!: number;
  paymentMethod!: string;
  saleDate!: Date;
}
