import { IsUUID, IsNotEmpty, IsDateString, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsUUID()
  departmentId: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  reasonForVisit?: string;
}
