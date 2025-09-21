import { IsEmail, IsNotEmpty } from "class-validator";

export class ChangeEmailDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}