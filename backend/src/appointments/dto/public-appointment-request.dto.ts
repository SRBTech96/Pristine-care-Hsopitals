import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class PublicAppointmentRequestDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;

  @IsUUID()
  departmentId: string;

  @IsUUID()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  requestedDate: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  requestedTime: string; // HH:mm

  @IsOptional()
  @IsString()
  reasonForVisit?: string;
}

export class PublicAppointmentResponseDto {
  requestId: string;
  status: string;
  message: string;
}
