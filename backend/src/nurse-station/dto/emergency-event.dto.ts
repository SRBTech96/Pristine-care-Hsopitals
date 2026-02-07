import { IsUUID, IsString, IsOptional, IsDate, IsArray } from 'class-validator';

export class RaiseEmergencyEventDto {
  @IsOptional()
  @IsUUID()
  inpatientAdmissionId?: string;

  @IsUUID()
  patientId: string;

  @IsString()
  eventType: string; // cardiac arrest, respiratory distress, seizure, anaphylaxis, etc.

  @IsString()
  severity: string; // critical, high, medium, low

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  doctorsToNotify?: string[]; // Array of doctor IDs
}

export class AcknowledgeEmergencyEventDto {
  @IsString()
  eventId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ResolvEmergencyEventDto {
  @IsString()
  eventId: string;

  @IsString()
  outcome: string; // patient_stabilized, transferred_to_icu, clinical_death, etc.

  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @IsOptional()
  followUpRequired: boolean;
}

export class EmergencyEventResponseDto {
  id: string;
  inpatientAdmissionId: string;
  patientId: string;
  patientName: string;
  reportedById: string;
  reportedByName: string;
  eventType: string;
  severity: string;
  location: string;
  description: string;
  timeOfEvent: Date;
  responseStartTime: Date;
  responseEndTime: Date;
  doctorsNotifiedIds: string[];
  notifiedAt: Date;
  actionsTaken: string;
  outcome: string;
  status: string; // reported, acknowledged, in_progress, resolved, escalated
  resolvingDoctorId: string;
  resolvingDoctorName: string;
  resolvedAt: Date;
  followUpRequired: boolean;
  followUpNotes: string;
  createdAt: Date;
  updatedAt: Date;
}
