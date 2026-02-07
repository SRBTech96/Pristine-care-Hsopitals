import { IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateFollowUpDto {
  @IsUUID()
  leadId: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  followUpType: string; // call, email, sms, in_person_visit

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteFollowUpDto {
  @IsString()
  outcome: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class FollowUpResponseDto {
  id: string;
  leadId: string;
  doctorId?: string;
  scheduledDate: Date;
  followUpType: string;
  status: string;
  notes?: string;
  outcome?: string;
  createdAt: Date;
  completedAt?: Date;
}
