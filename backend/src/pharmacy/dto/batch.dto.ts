import { IsUUID, IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateBatchDto {
  @IsUUID()
  inventoryId!: string;

  @IsString()
  batchNumber!: string;

  @IsDateString()
  expiryDate!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  costPrice!: number;
}

export class BatchResponseDto {
  id!: string;
  inventoryId!: string;
  batchNumber!: string;
  expiryDate!: Date;
  quantity!: number;
}
