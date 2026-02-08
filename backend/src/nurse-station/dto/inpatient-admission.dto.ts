import { IsUUID, IsString, IsOptional, IsBoolean, IsDate, ValidateIf } from 'class-validator';

  @IsUUID()
  patientId!: string;

  @IsUUID()
  bedId!: string;

  @IsUUID()
  wardId!: string;

  @IsString()
  admissionType!: string; // emergency, scheduled, transfer

  @IsUUID()
  attendingDoctorId!: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  admissionNotes?: string;

  @IsOptional()
  @IsBoolean()
  isIcu?: boolean;

  @IsOptional()
  @IsBoolean()
  isNicu?: boolean;
}

export class UpdateInpatientAdmissionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  dischargeSummary?: string;

  @IsOptional()
  @IsDate()
  dischargeDate?: Date;
}

export class InpatientAdmissionResponseDto {
  id!: string;
  patientId!: string;
  patientName!: string;
  bedId!: string;
  bedCode!: string;
  wardId!: string;
  wardName!: string;
  admissionDate!: Date;
  dischargeDate!: Date;
  admissionType!: string;
  attendingDoctorId!: string;
  attendingDoctorName!: string;
  chiefComplaint!: string;
  admissionNotes!: string;
  dischargeSummary!: string;
  status!: string;
  isIcu!: boolean;
  isNicu!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
