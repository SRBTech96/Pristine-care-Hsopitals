
import { IsUUID, IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';


export class MedicationScheduleDto {
  @IsUUID()
  doctorOrderId!: string;

  @IsUUID()
  inpatientAdmissionId!: string;

  @IsString()
  medicationName!: string;

  @IsString()
  dosage!: string;

  @IsString()
  unit!: string; // mg, ml, units, tablets, etc.

  @IsString()
  frequency!: string; // once daily, twice daily, every 6 hours, as needed

  @IsString()
  route!: string; // oral, IV, IM, SC, transdermal, topical, inhalation

  @IsDate()
  startDate!: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  durationDays?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  contraindications?: string;

  @IsOptional()
  @IsString()
  allergiesToCheck?: string;

  @IsOptional()
  @IsBoolean()
  requiresMonitoring?: boolean;

  @IsOptional()
  @IsString()
  monitoringParameters?: string;
}

export class UpdateMedicationScheduleDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class MedicationScheduleResponseDto {
  id!: string;
  doctorOrderId!: string;
  inpatientAdmissionId!: string;
  patientId!: string;
  patientName!: string;
  medicationName!: string;
  dosage!: string;
  unit!: string;
  frequency!: string;
  route!: string;
  startDate!: Date;
  endDate!: Date;
  durationDays!: number;
  specialInstructions!: string;
  contraindications!: string;
  allergiesToCheck!: string;
  requiresMonitoring!: boolean;
  monitoringParameters!: string;
  prescribingDoctorId!: string;
  prescribingDoctorName!: string;
  prescribedAt!: Date;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
