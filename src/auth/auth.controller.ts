import { Body, Controller, Delete, Param, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/users/schema/user.schema';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-step-one')
  async loginStepOne(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.loginStepOne(email, password);
  }

  @Post('login-step-two')
  async loginStepTwo(
    @Body('userId') userId: string,
    @Body('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginStepTwo(userId, code, response);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
   const login = await this.authService.login(user, response);
    response.send(login);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto){
    return this.authService.changePassword(dto.userId, dto.currentPassword, dto.newPassword);
  }

  @Post('change-email')
  async changeEmail(@Body() dto: ChangeEmailDto) {
    return this.authService.changeEmail(dto.userId, dto.newEmail);
  }

  @Delete('delete-account/:id')
  async deleteAccount(@Param('id') id: string) {
    return this.authService.softDelete(id);
  }
}