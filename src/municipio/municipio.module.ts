import { Module } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { MunicipioController } from './municipio.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Municipio, MunicipioSchema } from './schema/municipio.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Municipio.name,
        schema: MunicipioSchema,
      }
    ])
  ],
  controllers: [MunicipioController],
  providers: [MunicipioService],
  exports: [MunicipioService],
})
export class MunicipioModule {}
