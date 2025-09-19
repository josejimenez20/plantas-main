import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Municipio {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  departamento: string;

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
}

export const MunicipioSchema = SchemaFactory.createForClass(Municipio);