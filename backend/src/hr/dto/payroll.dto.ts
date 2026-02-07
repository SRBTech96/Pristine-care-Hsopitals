import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayrollDto {
  @IsDateString()
  monthYear: string;

  @IsNumber()
  @IsOptional()
  unpaidLeaveDays?: number;

  @IsNumber()
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @IsOptional()
  bonusAmount?: number;

  @IsOptional()
  @IsString()
  bonusReason?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdatePayrollDto {
  @IsNumber()
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @IsOptional()
  bonusAmount?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class PayrollRecordResponseDto {
  id: string;
  employeeId: string;
  monthYear: Date;
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  status: string;
  paymentDate?: Date;
  paymentReference?: string;
}
