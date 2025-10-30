import { Injectable } from '@nestjs/common';
import { CreatePlantaDto } from './dto/create-planta.dto';
import { UpdatePlantaDto } from './dto/update-planta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Planta } from './schema/planta.schemas';
import { Model, Types } from 'mongoose';
import { FilterPlantaDto } from './dto/filter-planta.dto';
import { DmsService } from 'src/dms/dms.service';

@Injectable()
export class PlantasService {
  constructor(
    @InjectModel(Planta.name) private readonly plantaModel: Model<Planta>,
    private readonly dmsService: DmsService,
  ) {}
  create(createPlantaDto: CreatePlantaDto) {
    return 'This action adds a new planta on plantas';
  }

  async findAll(page: number = 1, limit: number = 10, sort: string = 'nombre') {
    const plantas = await this.plantaModel
      .find()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('municipio_id')
      .populate('imagen');

    const count = await this.plantaModel.countDocuments();
    const resultData = [];

    for (const plantaDoc of plantas) {
      const planta = plantaDoc.toObject();

      if (planta.imagen && planta.imagen._id) {
        const result = await this.dmsService.getPresignedUrl(
          planta.imagen._id.toString(),
        );

        planta.imagen = {
          _id: planta.imagen._id,
          title: planta.imagen.title,
          url: result.url,
          isPublic: planta.imagen.isPublic ?? false,
          privacy: planta.imagen.privacy
        };
      }

      resultData.push(planta);
    }

    return {
      data: resultData,
      total: count,
      page,
      limit,
    };
  }
  async findOne(id: string) {
    const plantaDoc = await this.plantaModel
      .findById(id)
      .populate('municipio_id')
      .populate('imagen');

    if (!plantaDoc) {
      return null;
    }

    const planta = plantaDoc.toObject();

    if (planta.imagen && planta.imagen._id) {
      const result = await this.dmsService.getPresignedUrl(
        planta.imagen._id.toString(),
      );

      planta.imagen = {
        _id: planta.imagen._id,
        title: planta.imagen.title,
        url: result.url, 
        isPublic: planta.imagen.isPublic ?? false,
        privacy: planta.imagen.privacy
      };
    }

    return planta;
  }

  update(id: number, updatePlantaDto: UpdatePlantaDto) {
    return `This action updates a #${id} planta`;
  }

  async filterPlants(
    filtro: FilterPlantaDto,
    page: number,
    limit: number,
    sort: string,
  ) {
    const currentPage = Math.max(1, Number(page) || 1);
    const currentLimit = Math.max(1, Number(limit) || 10);
    const query = {};
    if (filtro.nombre) {
      query['nombre'] = { $regex: filtro.nombre.toLowerCase(), $options: 'i' };
    }
    if (filtro.clima) {
      query['clima'] = { $regex: filtro.clima.toLowerCase(), $options: 'i' };
    }
    if (filtro.tipo_suelo) {
      query['tipo_suelo'] = {
        $regex: filtro.tipo_suelo.toLowerCase(),
        $options: 'i',
      };
    }
    if (filtro.exposicion_luz) {
      query['exposicion_luz'] = {
        $regex: filtro.exposicion_luz.toLowerCase(),
        $options: 'i',
      };
    }
    if (filtro.frecuencia_agua) {
      query['frecuencia_agua'] = {
        $regex: filtro.frecuencia_agua.toLowerCase(),
        $options: 'i',
      };
    }
    if (filtro.proposito) {
      query['proposito'] = {
        $regex: filtro.proposito.toLowerCase(),
        $options: 'i',
      };
    }
    if (filtro.descripcion) {
      query['descripcion'] = {
        $regex: filtro.descripcion.toLowerCase(),
        $options: 'i',
      };
    }
    if (filtro.tamano_espacio) {
      query['tamano_espacio'] = {
        $regex: filtro.tamano_espacio.toLowerCase(),
        $options: 'i',
      };
    }
    if (filtro.municipio_id) {
      if (Types.ObjectId.isValid(filtro.municipio_id)) {
        query['municipio_id'] = new Types.ObjectId(filtro.municipio_id);
      } else {
        throw new Error('Invalid municipio_id');
      }
    }

    const skip = (page - 1) * limit;

    const plantas = await this.plantaModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate('municipio_id')
      .populate('imagen');

    const count = await this.plantaModel.countDocuments(query);

    const resultData = [];

    for (const plantaDoc of plantas) {
      const planta = plantaDoc.toObject();

      if (planta.imagen && planta.imagen._id) {
        const result = await this.dmsService.getPresignedUrl(
          planta.imagen._id.toString(),
        );

        planta.imagen = {
          _id: planta.imagen._id,
          title: planta.imagen.title,
          url: result.url,
          isPublic: planta.imagen.isPublic ?? false,
          privacy: planta.imagen.privacy
        };
      }

      resultData.push(planta);
    }

    return {
      data: resultData,
      total: Number(count),
      page: currentPage,
      limit: currentLimit,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} planta`;
  }
}
