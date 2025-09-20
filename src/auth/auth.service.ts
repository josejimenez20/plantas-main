import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { User } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { PasswordResetToken } from './schemas/password-reset.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly urlFrontend: string;
  private readonly jwt_access_token_secret: string;
  private readonly jwt_refresh_token_secret: string;
  private readonly jwt_access_token_expiration: string;
  private readonly jwt_refresh_token_expiration: string;
  private readonly node_env: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(PasswordResetToken.name)
    private readonly resetTokenModel: Model<PasswordResetToken>,
    private readonly mailService: MailService,
  ) {
    this.urlFrontend = this.configService.getOrThrow<string>('URL_FRONTEND');
    this.jwt_access_token_secret = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');
    this.jwt_refresh_token_secret = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET');
    this.jwt_access_token_expiration = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS');
    this.jwt_refresh_token_expiration = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS');
    this.node_env = this.configService.getOrThrow<string>('NODE_ENV');
  }

  async login(user: User, response: Response) {
    const expirateAccessToken = new Date();
    expirateAccessToken.setMilliseconds(
      expirateAccessToken.getTime() +
        parseInt(
          this.jwt_access_token_expiration,
        ),
    );

    const expirateRefreshToken = new Date();
    expirateRefreshToken.setMilliseconds(
      expirateRefreshToken.getTime() +
        parseInt(
          this.jwt_refresh_token_expiration,
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.jwt_access_token_secret,
      expiresIn: `${this.jwt_access_token_expiration}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.jwt_refresh_token_secret,
      expiresIn: `${this.jwt_refresh_token_expiration}ms`,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: await hash(refreshToken, 10) } },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.node_env === 'production',
      sameSite: 'none',
      expires: expirateAccessToken,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.node_env === 'production',
      sameSite: 'none',
      expires: expirateRefreshToken,
    });

    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });

      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async verifyRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ _id: userId });
      const authenticated = await compare(refreshToken, user.refreshToken);

      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.getUser({ email });
    if (!user) throw new NotFoundException('Email no encontrado');

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); 

    await this.resetTokenModel.create({
      userId: user._id,
      token,
      expires,
    });

    const resetUrl = `${this.urlFrontend}/reset-password?token=${token}`;

    await this.mailService.sendPasswordReset(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.resetTokenModel.findOne({ token });

    if (!record || record.expires < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const user = await this.usersService.getUser({ _id: record.userId });
    const hashedPassword = await hash(newPassword, 10);

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { password: hashedPassword } },
    );

    await this.resetTokenModel.deleteOne({ _id: record._id });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.getUser({ _id: userId });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    const isCurrentPasswordValid = await compare(currentPassword, user.password);
  
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }
  
    const hashedNewPassword = await hash(newPassword, 10);
  
    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { password: hashedNewPassword } },
    );
  
    return { message: 'La contraseña ha sido cambiada exitosamente' };
  }

}
