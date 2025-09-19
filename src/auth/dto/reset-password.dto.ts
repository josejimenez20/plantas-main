import { IsString, MinLength } from "class-validator";

// reset-password.dto.ts
export class ResetPasswordDto {
  @IsString() token: string;
  @MinLength(8) newPassword: string;
}
