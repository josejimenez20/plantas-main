import { PartialType } from "@nestjs/mapped-types";
import { CreateFavoritaDto } from "./create-favorita.dto";

export class DeleteFavoritaDto extends PartialType(CreateFavoritaDto) {}