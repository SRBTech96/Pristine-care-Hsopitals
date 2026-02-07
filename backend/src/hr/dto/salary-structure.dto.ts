import { IsUUID, IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSalaryStructureDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTill?: string;

  @IsNumber()
  baseSalary: number;

  @IsOptional()
  allowances?: {
    house_rent?: number;
    medical?: number;
    travel?: number;
    dearness?: number;
    [key: string]: number | undefined;
  };

  @IsOptional()
  deductions?: {
    pf?: number;
    gratuity?: number;
    loan?: number;
    [key: string]: number | undefined;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  notes?: string;
}

export class SalaryStructureResponseDto {
  id: string;
  employeeId: string;
  baseSalary: number;
  grossSalary: number;
  effectiveFrom: Date;
  effectiveTill?: Date;
  isActive: boolean;
  approvedBy?: string;
}
