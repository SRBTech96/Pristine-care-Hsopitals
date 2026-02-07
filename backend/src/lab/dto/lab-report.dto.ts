import { IsUUID, IsString, IsOptional } from 'class-validator';

export class PublishLabReportDto {
  @IsUUID()
  orderId: string;

  @IsString()
  results: string; // JSON string or test result data

  @IsOptional()
  @IsString()
  interpretation?: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;
}

export class ApproveLabReportDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class LabReportResponseDto {
  id: string;
  reportNumber: string;
  orderId: string;
  status: string;
  reportDate: Date;
  approvalDate?: Date;
  publishedAt?: Date;
}
