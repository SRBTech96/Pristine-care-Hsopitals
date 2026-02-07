import { IsUUID, IsNumber, IsOptional, IsString, IsDate, IsBoolean } from 'class-validator';

export class RecordVitalsDto {
  @IsUUID()
  inpatientAdmissionId: string;

  @IsOptional()
  @IsNumber()
  temperatureCelsius?: number;

  @IsOptional()
  @IsNumber()
  heartRateBpm?: number;

  @IsOptional()
  @IsNumber()
  systolicBp?: number;

  @IsOptional()
  @IsNumber()
  diastolicBp?: number;

  @IsOptional()
  @IsNumber()
  respiratoryRateRpm?: number;

  @IsOptional()
  @IsNumber()
  oxygenSaturationPercent?: number;

  @IsOptional()
  @IsNumber()
  bloodGlucoseMmol?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  painScore?: number; // 0-10

  @IsOptional()
  @IsNumber()
  gcsScore?: number;

  @IsOptional()
  @IsString()
  consciousnessLevel?: string;

  @IsOptional()
  @IsNumber()
  urineOutputMl?: number;

  @IsOptional()
  @IsString()
  bowelMovementStatus?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  abnormalFindings?: boolean;

  @IsOptional()
  @IsUUID()
  reportToDoctorId?: string; // Doctor ID if abnormal findings to report
}

export class VitalsRecordResponseDto {
  id: string;
  inpatientAdmissionId: string;
  patientId: string;
  patientName: string;
  recordedById: string;
  recordedByName: string;
  recordedAt: Date;
  temperatureCelsius: number;
  heartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  respiratoryRateRpm: number;
  oxygenSaturationPercent: number;
  bloodGlucoseMmol: number;
  weightKg: number;
  heightCm: number;
  painScore: number;
  gcsScore: number;
  consciousnessLevel: string;
  urineOutputMl: number;
  bowelMovementStatus: string;
  notes: string;
  abnormalFindings: boolean;
  reportedToDoctorId: string;
  reportedToDoctorName: string;
  reportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
