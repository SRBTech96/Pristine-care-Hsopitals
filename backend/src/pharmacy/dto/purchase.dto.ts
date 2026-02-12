import { IsUUID, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePurchaseDto {
  @IsUUID()
  inventoryId!: string;

  @IsUUID()
  batchId!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitCost!: number;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;
}

export class PurchaseResponseDto {
  id!: string;
  purchaseNumber!: string;
  inventoryId!: string;
  batchId!: string;
  quantity!: number;
  totalCost!: number;
}
