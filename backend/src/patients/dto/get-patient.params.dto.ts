import { IsUUID } from 'class-validator';

export class GetPatientParamsDto {
  @IsUUID()
  id!: string;
}
