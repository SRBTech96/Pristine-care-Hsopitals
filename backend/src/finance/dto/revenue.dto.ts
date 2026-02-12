import { IsUUID, IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateRevenueDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsUUID()
  discountApprovalId?: string;

  @IsString()
  @IsEnum(['cash', 'bank', 'upi', 'card'])
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RevenueResponseDto {
  id!: string;
  receiptNumber!: string;
  patientId?: string;
  appointmentId?: string;
  doctorId?: string;
  departmentId?: string;
  amount!: number;
  discountAmount!: number;
  finalAmount!: number;
  paymentMethod!: string;
  paymentDate!: Date;
  status!: string;
}
