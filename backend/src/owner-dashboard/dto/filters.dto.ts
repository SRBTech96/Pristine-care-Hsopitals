import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class OwnerFilterDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
