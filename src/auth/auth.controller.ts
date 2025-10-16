import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/users/schema/user.schema';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login-step-one')
  async loginStepOne(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
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

  //For google OAuth
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Inicia el flujo de OAuth
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @CurrentUser() user: User,
    @Res() response: Response,
  ) {
    try {
      if (!user) {
        throw new Error('No se pudo obtener el usuario');
      }

      const result = await this.authService.login(user, response);

      const frontendUrl = this.configService.getOrThrow<string>(
        'URL_FRONTEND_GOOGLE_REDIRECT',
      );

      response.redirect(
        `${frontendUrl}?accessToken=${result.accessToken}&success=true`,
      );
    } catch (error) {
      const frontendUrl = this.configService.getOrThrow<string>(
        'URL_FRONTEND_GOOGLE_REDIRECT',
      );
      response.redirect(
        `${frontendUrl}?error=auth_failed&message=${encodeURIComponent((error as Error).message)}`,
      );
    }
  }
  //Fin Google OAuth

  //
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
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      dto.userId,
      dto.currentPassword,
      dto.newPassword,
    );
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
