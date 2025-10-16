import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { SchemaTypes, Types } from "mongoose";
import { Municipio } from "../../municipio/schema/municipio.schema";
import { Planta } from "src/plantas/schema/planta.schemas";
import { Image } from "src/imgdb/schemas/image.schema";

@Schema({timestamps: true})
export class User {
  @Prop({ type: SchemaTypes.ObjectId, auto: true})
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;
  
  @Prop({ unique: true })
  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Municipio', required: true })
  municipio: Municipio;

  @Prop()
  refreshToken?: string;

  @Prop()
  password: string;
  
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Planta' }],
    default: [],
  })
  favorites: Planta[];
    
  @Prop({ required: true, default: 'client' })
  role: string;

  @Prop({
    required: true,
    default: false
  })
  isDeleted: boolean

    // Google OAuth fields
  @Prop({ default: 'local' })
  provider: string; // 'google', 'local'

  @Prop()
  providerId: string; 

  @Prop()
  picture: string;
  
  @Prop({
    type:  String,
    ref: 'Image',
  })
  pictureMongo: Image;

}

export const UserSchema = SchemaFactory.createForClass(User);