import { IsString, IsUUID, IsNumber, IsEnum, IsOptional, Min, Matches } from 'class-validator';

export class CreateLineItemDto {
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

export class LineItemResponseDto {
  id: string;
  invoiceId: string;
  lineType: string;
  referenceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalLineAmount: number;
  hsnCode: string;
  createdAt: Date;
}
