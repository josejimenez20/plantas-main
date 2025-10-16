import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20'; // Cambia a oauth20
import { MunicipioService } from 'src/municipio/municipio.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly municipioService: MunicipioService,
  ) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;

      // Buscar usuario por providerId O email
      const userByProvider = await this.usersService.findUserAuth({ 
        providerId: id, 
        provider: 'google' 
      });

      const userByEmail = await this.usersService.findUserAuth({ 
        email: emails[0].value 
      });

      let user = userByProvider || userByEmail;

      if (!user) {
        
        // Obtener municipio por defecto
        const defaultMunicipio = await this.getDefaultMunicipio();
        
        if (!defaultMunicipio) {
          throw new Error('No se pudo obtener un municipio por defecto');
        }

        // Crear nuevo usuario
        user = await this.usersService.createUser({
          provider: 'google',
          providerId: id,
          email: emails[0].value,
          name: `${name.givenName} ${name.familyName}`.trim(),
          picture: photos[0]?.value,
          municipio: defaultMunicipio, // Solo el ID, no el objeto completo
          role: 'client',
          password: null,
          isDeleted: false,
        });

      } else if (user.provider !== 'google') {
        throw new Error('Este email ya está registrado con otro método de autenticación');
      }

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }

  private async getDefaultMunicipio() {
    try {
      const municipios = await this.municipioService.findAll();
      return municipios[0]; // Retorna el primer municipio, no el array
    } catch (error) {
      console.error('Error obteniendo municipio por defecto:', error);
      throw new Error('No se pudo obtener el municipio por defecto');
    }
  }
}