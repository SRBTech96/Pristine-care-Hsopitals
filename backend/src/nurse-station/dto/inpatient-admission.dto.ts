
import { IsUUID, IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';


export class InpatientAdmissionDto {
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
  bedCode?: string | null;
  wardId!: string;
  wardName?: string | null;
  admissionDate!: Date;
  dischargeDate?: Date | null;
  admissionType!: string;
  attendingDoctorId!: string;
  attendingDoctorName?: string | null;
  chiefComplaint?: string | null;
  admissionNotes?: string | null;
  dischargeSummary?: string | null;
  status!: string;
  isIcu!: boolean;
  isNicu!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
