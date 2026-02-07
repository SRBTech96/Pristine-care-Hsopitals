import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  consultationNotes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class CancelAppointmentDto {
  @IsString()
  cancellationReason: string;

  @IsInt()
  @Min(1)
  version: number;
}
