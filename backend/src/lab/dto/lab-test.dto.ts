import { IsString, IsNumber, IsInt, IsOptional } from 'class-validator';

export class CreateLabTestDto {
  @IsString()
  testCode: string;

  @IsString()
  testName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  sampleType: string;

  @IsInt()
  turnaroundTimeHours: number;

  @IsNumber()
  cost: number;
}

export class LabTestResponseDto {
  id!: string;
  testCode!: string;
  testName!: string;
  sampleType!: string;
  turnaroundTimeHours!: number;
  cost!: number;
}
