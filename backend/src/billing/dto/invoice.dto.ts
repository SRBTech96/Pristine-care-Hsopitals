import { IsString, IsUUID, IsNumber, IsDate, IsEnum, IsOptional, Min, Matches } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsUUID()
  discountApprovalId?: string;

  @IsDate()
  invoiceDate: Date;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsUUID()
  discountApprovalId?: string;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsEnum(['issued', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddLineItemDto {
  @IsEnum(['appointment', 'lab_order', 'pharmacy_sale', 'service', 'other'])
  lineType: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsString()
  @Matches(/^[0-9]{2,8}$/, { message: 'HSN code must be 2-8 digits' })
  hsnCode: string;
}

export class InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  patientId?: string;
  appointmentId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  invoiceDate: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
