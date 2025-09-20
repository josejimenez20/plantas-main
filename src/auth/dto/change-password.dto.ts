import { IsNotEmpty, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: false })
class IsPasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const object = args.object as ChangePasswordDto;
    return object.newPassword === object.verifyPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return 'The new password and verify password must match';
  }
}

export class ChangePasswordDto {

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  newPassword: string;

  @IsNotEmpty()
  @Validate(IsPasswordsMatchConstraint)  
  verifyPassword: string;
}
