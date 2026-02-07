import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateWardDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  floorNumber?: number;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  floorNumber?: number;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WardResponseDto {
  id: string;
  name: string;
  code: string;
  floorNumber: number;
  building: string;
  totalBeds: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
