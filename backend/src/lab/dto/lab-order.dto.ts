import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLabOrderDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsUUID()
  testId: string;

  @IsDateString()
  requiredDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLabOrderStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LabOrderResponseDto {
  id: string;
  orderNumber: string;
  patientId: string;
  testId: string;
  status: string;
  orderDate: Date;
}
