import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Image } from 'src/imgdb/schemas/image.schema';

export type ProgresoDocument = Progreso & Document;

@Schema({ timestamps: true })
export class Progreso {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Cada usuario solo puede tener UN documento de progreso
  })
  user: User;

  @Prop({
    type: [{ type: String, ref: 'Image' }], // Guardamos los IDs de las imágenes (que son los keys de S3)
    default: [],
  })
  images: Image[];
}

export const ProgresoSchema = SchemaFactory.createForClass(Progreso);