import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoritaDto } from './create-favorita.dto';

export class UpdateFavoritaDto extends PartialType(CreateFavoritaDto) {}
