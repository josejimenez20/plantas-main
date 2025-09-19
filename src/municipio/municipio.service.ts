import { Injectable } from '@nestjs/common';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Municipio } from './schema/municipio.schema';
import { Model } from 'mongoose';

@Injectable()
export class MunicipioService {
  constructor(
    @InjectModel(Municipio.name)
    private readonly municipioModel: Model<Municipio>,
  ) { }
  
  create(createMunicipioDto: CreateMunicipioDto) {
    return 'This action adds a new municipio';
  }

  findAll() {
    return this.municipioModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} municipio`;
  }

  update(id: number, updateMunicipioDto: UpdateMunicipioDto) {
    return `This action updates a #${id} municipio`;
  }

  remove(id: number) {
    return `This action removes a #${id} municipio`;
  }
}
