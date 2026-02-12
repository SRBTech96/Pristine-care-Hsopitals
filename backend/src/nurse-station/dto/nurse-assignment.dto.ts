import { IsUUID, IsString, IsOptional, IsArray, IsDate } from 'class-validator';


export class NurseAssignmentDto {
  @IsUUID()
  nurseId!: string;

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
  id!: string;
  nurseId!: string;
  nurseeName!: string;
  wardId?: string | null;
  wardName?: string | null;
  floorNumber?: number | null;
  assignedBeds?: string[] | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  shiftDate?: Date | null;
  assignedById!: string;
  status!: string;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
