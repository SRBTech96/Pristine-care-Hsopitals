import { IsUUID, IsString, IsOptional, IsArray, IsDate, IsTime } from 'class-validator';

export class CreateNurseAssignmentDto {
  @IsUUID()
  nurseId: string;

  @IsOptional()
  @IsUUID()
  wardId?: string;

  @IsOptional()
  floorNumber?: number;

  @IsOptional()
  @IsArray()
  assignedBeds?: string[];

  @IsOptional()
  @IsString()
  shiftStartTime?: string;

  @IsOptional()
  @IsString()
  shiftEndTime?: string;

  @IsOptional()
  @IsDate()
  shiftDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateNurseAssignmentDto {
  @IsOptional()
  @IsArray()
  assignedBeds?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class NurseAssignmentResponseDto {
  id: string;
  nurseId: string;
  nurseeName: string;
  wardId: string;
  wardName: string;
  floorNumber: number;
  assignedBeds: string[];
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: Date;
  assignedById: string;
  status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
