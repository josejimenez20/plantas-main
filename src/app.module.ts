import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DmsController } from './dms/dms.controller';
import { DmsService } from './dms/dms.service';
import { DmsModule } from './dms/dms.module';
import { ImgdbModule } from './imgdb/imgdb.module';
import { RolesGuard } from './auth/guards/jwt-roles.guard';
import { MailModule } from './mail/mail.module';
import { MunicipioModule } from './municipio/municipio.module';
import { PlantasModule } from './plantas/plantas.module';
import { FavoritasModule } from './favoritas/favoritas.module';
import { ProgresoModule } from './progreso/progreso.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory:  (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGODB_URI')
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DmsModule,
    ImgdbModule,
    MailModule,
    MunicipioModule,
    PlantasModule,
    AuthModule,
    FavoritasModule,
    ProgresoModule,
  ],
  controllers: [AppController, DmsController],
  providers: [AppService, DmsService, RolesGuard],
})
export class AppModule {}
