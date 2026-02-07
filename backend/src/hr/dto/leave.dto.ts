import { IsUUID, IsEnum, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeaveDto {
  @IsUUID()
  employeeId: string;

  @IsEnum(['sick', 'casual', 'earned', 'unpaid', 'maternity', 'attendance_bonus'])
  leaveType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  numberOfDays: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateLeaveDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  numberOfDays?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class LeaveRequestResponseDto {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  status: string;
  approvalDate?: Date;
  approvedBy?: string;
}
