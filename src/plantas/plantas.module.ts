import { Module } from '@nestjs/common';
import { PlantasService } from './plantas.service';
import { PlantasController } from './plantas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Planta, PlantaSchema } from './schema/planta.schemas';
import { DmsService } from 'src/dms/dms.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Planta.name,
        schema: PlantaSchema
      }
    ])
  ],
  controllers: [PlantasController],
  providers: [PlantasService, DmsService],
  exports: [PlantasService],
})
export class PlantasModule {}
