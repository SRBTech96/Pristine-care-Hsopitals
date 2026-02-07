import { IsString, IsEmail, IsOptional, IsPhoneNumber, IsUUID, IsDateString } from 'class-validator';

export class CreatePatientLeadDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  interestedIn?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePatientLeadDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PatientLeadResponseDto {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  status: string;
  interestedIn?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
