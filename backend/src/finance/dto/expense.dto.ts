import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsString()
  paymentMethod: string; // cash, bank, upi, card

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExpenseResponseDto {
  id: string;
  expenseNumber: string;
  category: string;
  vendor?: string;
  amount: number;
  departmentId?: string;
  paymentMethod: string;
  expenseDate: Date;
  status: string;
}
