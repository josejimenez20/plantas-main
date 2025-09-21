import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TwoFactorCode extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  code: string; 

  @Prop({ required: true })
  expiresAt: Date;
}

export const TwoFactorCodeSchema = SchemaFactory.createForClass(TwoFactorCode);
