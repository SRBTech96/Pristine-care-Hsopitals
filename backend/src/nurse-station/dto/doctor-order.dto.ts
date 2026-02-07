import { IsUUID, IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class CreateDoctorOrderDto {
  @IsUUID()
  inpatientAdmissionId: string;

  @IsString()
  orderType: string; // medication, procedure, investigation, diet, activity, observation

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  priority?: string; // routine, urgent, stat

  @IsOptional()
  @IsDate()
  scheduledDate?: Date;

  @IsOptional()
  @IsDate()
  expectedCompletionDate?: Date;

  @IsOptional()
  @IsBoolean()
  approvalsRequired?: boolean;
}

export class UpdateDoctorOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class ApproveDoctorOrderDto {
  @IsOptional()
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class DoctorOrderResponseDto {
  id: string;
  inpatientAdmissionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  orderDate: Date;
  orderType: string;
  description: string;
  instructions: string;
  priority: string;
  status: string;
  scheduledDate: Date;
  expectedCompletionDate: Date;
  approvalsRequired: boolean;
  approvedById: string;
  approvedAt: Date;
  cancelledById: string;
  cancelledAt: Date;
  cancellationReason: string;
  createdAt: Date;
  updatedAt: Date;
}
