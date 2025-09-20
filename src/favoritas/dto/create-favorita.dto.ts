import { IsNotEmpty } from "class-validator";

export class CreateFavoritaDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  plantaId: string;
}
