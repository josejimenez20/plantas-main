import { Module } from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { ProgresoController } from './progreso.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progreso, ProgresoSchema } from './schema/progreso.schema';
import { DmsModule } from 'src/dms/dms.module';
import { ImgdbModule } from 'src/imgdb/imgdb.module';
import { DmsService } from 'src/dms/dms.service';
import { ImgdbService } from 'src/imgdb/imgdb.service';
import { Image, ImageSchema } from 'src/imgdb/schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progreso.name, schema: ProgresoSchema },
      // Importamos ImageSchema aquí para que ImgdbService funcione
      { name: Image.name, schema: ImageSchema } 
    ]),
    DmsModule,
    ImgdbModule,
  ],
  controllers: [ProgresoController],
  providers: [ProgresoService, DmsService, ImgdbService],
})
export class ProgresoModule {}