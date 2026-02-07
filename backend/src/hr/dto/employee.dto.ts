import { IsUUID, IsString, IsEnum, IsDate, IsOptional, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID()
  userId: string;

  @IsString()
  employeeId: string;

  @IsEnum(['doctor', 'staff'])
  employeeType: string;

  @IsUUID()
  departmentId: string;

  @IsString()
  designation: string;

  @IsDateString()
  dateOfJoining: string;

  @IsOptional()
  @IsDateString()
  dateOfTermination?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankIfscCode?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsDateString()
  dateOfTermination?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}

export class EmployeeResponseDto {
  id: string;
  employeeId: string;
  employeeType: string;
  designation: string;
  departmentId: string;
  dateOfJoining: Date;
  status: string;
  // Do not expose: panNumber, aadhaarNumber (sensitive)
}
