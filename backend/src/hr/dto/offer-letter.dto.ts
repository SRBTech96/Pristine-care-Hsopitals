import { IsUUID, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateOfferLetterDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  offerDate: string;

  @IsString()
  designation: string;

  @IsUUID()
  departmentId: string;

  @IsNumber()
  salary: number;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOfferLetterDto {
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OfferLetterResponseDto {
  id: string;
  employeeId: string;
  designation: string;
  salary: number;
  offerDate: Date;
  status: string;
  acceptanceDate?: Date;
  signingDate?: Date;
}
