import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator'

export class CreateUserRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()  
  @IsNotEmpty() 
  email: string;

  @IsString()
  @IsNotEmpty()
  municipio: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}