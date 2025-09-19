import { IsNotEmpty, IsString } from "class-validator";

export class CreatePlantaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  
  @IsString()
  @IsNotEmpty()
  nombre_cientifico: string;

  @IsString()
  @IsNotEmpty()
  clima: string;

  @IsString()
  @IsNotEmpty()
  tipo_suelo: string;

  @IsString()
  @IsNotEmpty()
  exposicion_luz: string;

  @IsString()
  @IsNotEmpty()
  frecuencia_agua: string;

  @IsString()
  @IsNotEmpty() 
  proposito: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  imagen: string;

  @IsString()
  tamano_espacio: string;

  @IsString()
  @IsNotEmpty()
  municipio_id: string;
}
