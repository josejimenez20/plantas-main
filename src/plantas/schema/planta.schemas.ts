import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Image } from 'src/imgdb/schemas/image.schema';
import { Municipio } from 'src/municipio/schema/municipio.schema';

@Schema({ timestamps: true })
export class Planta {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  nombre_cientifico: string;

  @Prop({ required: true })
  clima: string;

  @Prop({ required: true })
  tipo_suelo: string;

  @Prop({ required: true })
  exposicion_luz: string;

  @Prop({ required: true })
  frecuencia_agua: string;

  @Prop({ required: true })
  proposito: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
    ref: 'Image',
  })
  imagen: Image;

  @Prop({ required: true })
  tamano_espacio: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipio',
  })
  municipio_id: Municipio;
}

export const PlantaSchema = SchemaFactory.createForClass(Planta);
