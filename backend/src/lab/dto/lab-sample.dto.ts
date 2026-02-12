import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class CollectSampleDto {
  @IsUUID()
  orderId: string;

  @IsDateString()
  collectionDate: string;

  @IsString()
  @IsOptional()
  sampleQuality?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LabSampleResponseDto {
  id!: string;
  orderId!: string;
  sampleCode!: string;
  collectionDate!: Date;
  sampleQuality!: string;
}
