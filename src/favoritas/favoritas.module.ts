import { Module } from '@nestjs/common';
import { FavoritasService } from './favoritas.service';
import { FavoritasController } from './favoritas.controller';
import { UsersModule } from 'src/users/users.module';
import { PlantasModule } from 'src/plantas/plantas.module';

@Module({
  imports: [UsersModule, PlantasModule],
  controllers: [FavoritasController],
  providers: [FavoritasService],
})
export class FavoritasModule {}
