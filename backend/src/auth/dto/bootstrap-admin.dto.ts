import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class BootstrapAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsString()
  @IsNotEmpty()
  secret: string;
}
