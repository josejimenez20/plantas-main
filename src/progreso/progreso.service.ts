import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progreso, ProgresoDocument } from './schema/progreso.schema';
import { DmsService } from 'src/dms/dms.service';
import { ImgdbService } from 'src/imgdb/imgdb.service';
import { ImageType } from 'src/imgdb/dto/image.dto';

@Injectable()
export class ProgresoService {
  constructor(
    @InjectModel(Progreso.name)
    private readonly progresoModel: Model<ProgresoDocument>,
    private readonly dmsService: DmsService,
    private readonly imgdbService: ImgdbService,
  ) {}

  /**
   * Obtiene (o crea) el documento de progreso para un usuario y lo puebla
   * con las URLs de las imágenes.
   */
  async getProgresoForUser(userId: string) {
    let progresoDoc = await this.progresoModel
      .findOne({ user: userId })
      .populate('images'); // 'images' es el nombre del campo en ProgresoSchema

    if (!progresoDoc) {
      // Si el usuario no tiene documento, creamos uno vacío
      progresoDoc = await this.progresoModel.create({ user: userId, images: [] });
    }

    // Convertimos a objeto para poder modificarlo
    const progreso = progresoDoc.toObject();

    // Generamos las URLs firmadas para cada imagen
    const imagesWithUrls = [];
    for (const image of progreso.images) {
      if (image && image._id) {
        const result = await this.dmsService.getPresignedUrl(image._id);
        imagesWithUrls.push({
          ...image, // Mantenemos el resto de propiedades de la imagen
          url: result.url,
        });
      }
    }
    
    progreso.images = imagesWithUrls;
    return progreso;
  }

  /**
   * Sube múltiples archivos al DmsService, los guarda en ImgdbService
   * y los añade al documento de progreso del usuario.
   */
  async addFotosToProgreso(userId: string, files: Array<Express.Multer.File>) {
    const uploadedImages = [];

    // 1. Subir todos los archivos
    for (const file of files) {
      const imageInfo: ImageType = await this.dmsService.uploadSingleFile({
        file,
        isPublic: false, // Las fotos de progreso deben ser privadas
      });

      // 2. Guardar en la base de datos de imágenes (imgdb)
      const imageDB = {
        _id: imageInfo.key, // El ID es el Key de S3/Wasabi
        url: imageInfo.url,
        isPublic: imageInfo.isPublic,
        title: file.originalname,
      };
      const newImage = await this.imgdbService.createImage(imageDB);
      uploadedImages.push(newImage);
    }

    const imageIds = uploadedImages.map((img) => img._id);

    // 3. Obtener el documento de progreso (o crearlo)
    const progreso = await this.getProgresoForUser(userId);

    // 4. Añadir los IDs de las nuevas imágenes al array (usando $push)
    await this.progresoModel.updateOne(
      { _id: progreso._id },
      {
        $push: { images: { $each: imageIds } },
      },
    );

    return { message: 'Fotos subidas correctamente' };
  }

  /**
   * Elimina una foto del progreso del usuario y del almacenamiento.
   */
  async deleteFotoFromProgreso(userId: string, imageId: string) {
    const progreso = await this.progresoModel.findOne({ user: userId });

    if (!progreso) {
      throw new NotFoundException('No se encontró el registro de progreso.');
    }

    // 1. Quitar la imagen del array en el documento de progreso
    await this.progresoModel.updateOne(
      { _id: progreso._id },
      {
        $pull: { images: imageId },
      },
    );

    // 2. Eliminar del Dms (S3/Wasabi)
    await this.dmsService.deleteFile(imageId);

    // 3. Eliminar de la base de datos de imágenes (imgdb)
    await this.imgdbService.deleteImage(imageId);

    return { message: 'Foto eliminada correctamente' };
  }
}