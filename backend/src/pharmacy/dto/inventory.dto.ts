import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsNumber()
  unitPrice: number;
}

export class InventoryResponseDto {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
}
