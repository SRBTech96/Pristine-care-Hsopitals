import { IsUUID, IsString, IsOptional, IsBoolean, IsDate, IsNumber } from 'class-validator';

export class ExecuteMedicationDto {
  @IsUUID()
  medicationScheduleId: string;

  @IsOptional()
  @IsString()
  actualDosage?: string;

  @IsOptional()
  @IsString()
  routeUsed?: string;

  @IsOptional()
  @IsString()
  siteOfAdministration?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  nurseNotes?: string;

  @IsOptional()
  @IsString()
  patientResponse?: string;

  @IsOptional()
  @IsBoolean()
  sideEffectsObserved?: boolean;

  @IsOptional()
  @IsString()
  sideEffectsDetails?: string;
}

export class SkipMedicationDto {
  @IsUUID()
  medicationScheduleId: string;

  @IsString()
  reason: string; // patient refusal, medication unavailable, patient NPO, etc.

  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyMedicationAdministrationDto {
  @IsString()
  status: string; // accepted, rejected

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MedicationAdministrationResponseDto {
  id: string;
  medicationScheduleId: string;
  medicationName: string;
  dosage: string;
  route: string;
  inpatientAdmissionId: string;
  patientId: string;
  patientName: string;
  scheduledTime: Date;
  administeredTime: Date;
  administeredById: string;
  administeredByName: string;
  status: string; // pending, administered, refused, held, delayed, not_given
  reasonIfNotGiven: string;
  actualDosage: string;
  routeUsed: string;
  siteOfAdministration: string;
  batchNumber: string;
  expiryDate: Date;
  nurseNotes: string;
  patientResponse: string;
  sideEffectsObserved: boolean;
  sideEffectsDetails: string;
  verifiedById: string;
  verifiedByName: string;
  verifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
