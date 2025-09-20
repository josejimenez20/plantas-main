import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlantasService } from './plantas.service';
import { CreatePlantaDto } from './dto/create-planta.dto';
import { UpdatePlantaDto } from './dto/update-planta.dto';
import { FilterPlantaDto } from './dto/filter-planta.dto';

@Controller('plantas')
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Post()
  create(@Body() createPlantaDto: CreatePlantaDto) {
    return this.plantasService.create(createPlantaDto);
  }

  @Get()
  findAll() {
    return this.plantasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantasService.findOne(id);
  }

  @Get('filter/query')
  async filterPlants(
    @Query() filter: FilterPlantaDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'nombre',
  ) {
    return this.plantasService.filterPlants(filter, page, limit, sort);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlantaDto: UpdatePlantaDto) {
    return this.plantasService.update(+id, updatePlantaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantasService.remove(+id);
  }
}
