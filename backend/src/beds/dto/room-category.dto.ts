import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoomCategoryDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

export class UpdateRoomCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoomCategoryResponseDto {
  id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
