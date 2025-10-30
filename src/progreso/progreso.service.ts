import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'; // <-- Añadir UnauthorizedException
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

  // ... (getProgresoForUser, addFotosToProgreso - sin cambios)
  async getProgresoForUser(userId: string) {
    let progresoDoc = await this.progresoModel
      .findOne({ user: userId })
      .populate('images');

    if (!progresoDoc) {
      progresoDoc = await this.progresoModel.create({ user: userId, images: [] });
    }

    const progreso = progresoDoc.toObject();

    const imagesWithUrls = [];
    // Asegurarnos de que 'images' existe y es un array
    if (progreso.images && Array.isArray(progreso.images)) {
      for (const image of progreso.images) {
        if (image && image._id) {
          const result = await this.dmsService.getPresignedUrl(image._id);
          imagesWithUrls.push({
            ...image,
            url: result.url,
            // Asegurarnos de que la privacidad se envíe al frontend
            privacy: image.privacy || 'Solo yo', 
          });
        }
      }
    }
    
    progreso.images = imagesWithUrls;
    return progreso;
  }

  async addFotosToProgreso(userId: string, files: Array<Express.Multer.File>) {
    const uploadedImages = [];

    for (const file of files) {
      const imageInfo: ImageType = await this.dmsService.uploadSingleFile({
        file,
        isPublic: false, 
      });

      const imageDB = {
        _id: imageInfo.key,
        url: imageInfo.url,
        isPublic: imageInfo.isPublic,
        title: file.originalname,
        privacy: 'Solo yo', // Default privacy al subir
      };
      const newImage = await this.imgdbService.createImage(imageDB);
      uploadedImages.push(newImage);
    }

    const imageIds = uploadedImages.map((img) => img._id);
    
    // Usamos findOneAndUpdate con upsert:true para crear si no existe
    await this.progresoModel.findOneAndUpdate(
      { user: userId },
      { $push: { images: { $each: imageIds } } },
      { upsert: true, new: true },
    );

    return { message: 'Fotos subidas correctamente' };
  }

  // ... (deleteFotoFromProgreso - sin cambios)
  async deleteFotoFromProgreso(userId: string, imageId: string) {
    const progreso = await this.progresoModel.findOne({ user: userId });

    if (!progreso) {
      throw new NotFoundException('No se encontró el registro de progreso.');
    }

    await this.progresoModel.updateOne(
      { _id: progreso._id },
      { $pull: { images: imageId } },
    );

    await this.dmsService.deleteFile(imageId);
    await this.imgdbService.deleteImage(imageId);

    return { message: 'Foto eliminada correctamente' };
  }

  // --- NUEVA FUNCIÓN AÑADIDA ---
  /**
   * Requisito: "Permitir cambiar la privacidad de una foto ya publicada."
   */
  async updateFotoPrivacy(userId: string, imageId: string, newPrivacy: string) {
    // 1. Validar que el usuario sea dueño de la foto
    const progreso = await this.progresoModel.findOne({
      user: userId,
      images: { $in: [imageId] }, // ¿Esta imagen está en el array de progreso del usuario?
    });

    if (!progreso) {
      throw new UnauthorizedException('No tienes permiso para editar esta foto.');
    }

    // 2. Actualizar la privacidad en el servicio de imágenes
    await this.imgdbService.updatePrivacy(imageId, newPrivacy);

    return { message: 'Privacidad actualizada correctamente' };
  }
}