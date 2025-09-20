import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FavoritasService } from './favoritas.service';
import { CreateFavoritaDto } from './dto/create-favorita.dto';
import { UpdateFavoritaDto } from './dto/update-favorita.dto';

@Controller('favoritas')
export class FavoritasController {
  constructor(private readonly favoritasService: FavoritasService) {}

  @Post()
  create(@Body() createFavoritaDto: CreateFavoritaDto) {
    return this.favoritasService.create(createFavoritaDto);
  }

  @Get()
  findAll() {
    return this.favoritasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoritasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFavoritaDto: UpdateFavoritaDto) {
    return this.favoritasService.update(+id, updateFavoritaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoritasService.remove(+id);
  }
}
