import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset.schema';
import { MailModule } from 'src/mail/mail.module';
import {
  TwoFactorCode,
  TwoFactorCodeSchema,
} from './schemas/two-factor-code.schema';
import { GoogleStrategy } from './strategies/google.strategy';
import { MunicipioModule } from 'src/municipio/municipio.module';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      {
        name: PasswordResetToken.name,
        schema: PasswordResetTokenSchema,
      },
      {
        name: TwoFactorCode.name,
        schema: TwoFactorCodeSchema,
      },
    ]),
    UsersModule,
    PassportModule,
    JwtModule,
    MunicipioModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, GoogleStrategy],
})
export class AuthModule {}
