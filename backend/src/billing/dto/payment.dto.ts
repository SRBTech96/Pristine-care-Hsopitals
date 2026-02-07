import { IsString, IsUUID, IsNumber, IsDate, IsEnum, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'credit_note'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsDate()
  paymentDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  receivedBy?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(['completed', 'failed', 'refunded'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentResponseDto {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  patientId?: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: Date;
  status: string;
  receivedBy?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
