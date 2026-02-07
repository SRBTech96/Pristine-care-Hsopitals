import { IsString, IsUUID, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateDiscountApprovalDto {
  @IsString()
  targetType: string; // appointment, patient_lead, bundle, service

  @IsUUID()
  targetId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class DiscountApprovalResponseDto {
  id: string;
  targetType: string;
  targetId: string;
  discountPercentage?: number;
  discountAmount?: number;
  reason?: string;
  approvedBy: string;
  approvalDate: Date;
  expiresAt?: Date;
  status: string;
  createdAt: Date;
}
