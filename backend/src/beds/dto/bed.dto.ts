import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum BedStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export class CreateBedDto {
  @IsString()
  bedCode: string;

  @IsUUID()
  wardId: string;

  @IsUUID()
  roomCategoryId: string;

  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  bedPosition?: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

export class UpdateBedStatusDto {
  @IsEnum(BedStatus)
  status: BedStatus;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  changeReason?: string;

  @IsOptional()
  @IsString()
  estimatedDischargeDate?: string;
}

export class BedResponseDto {
  id: string;
  bedCode: string;
  wardId: string;
  wardName: string;
  roomCategoryId: string;
  roomCategoryName: string;
  roomNumber: string;
  bedPosition: string;
  status: string;
  currentPatientId: string;
  currentPatientName: string;
  assignedToUserId: string;
  admissionDate: Date;
  estimatedDischargeDate: Date;
  specialRequirements: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BedSummaryDto {
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  occupancyRate: number;
  byWard: WardSummaryDto[];
}

export class WardSummaryDto {
  wardId: string;
  wardName: string;
  category: string;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
}
