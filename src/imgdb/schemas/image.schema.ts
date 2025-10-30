import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ImageDocument = HydratedDocument<Image>;
@Schema({
  timestamps: true,
})
export class Image {
    @Prop({ required: true, trim: true })
    _id: string;
  
  @Prop({ required: false, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: true, trim: true })
  isPublic: boolean;

  @Prop({
    type: String,
    enum: ['Solo yo', 'Amigos', 'Público'],
    default: 'Solo yo', // Por defecto, las fotos son privadas
  })
  privacy: string;

}

export const ImageSchema = SchemaFactory.createForClass(Image);
