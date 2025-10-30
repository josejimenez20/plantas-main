import { Injectable, BadRequestException, NotFoundException} from '@nestjs/common'; // <-- Añadir BadRequestException
import { Image, ImageDocument } from './schemas/image.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ImgdbService {
  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<Image>,
  ) {}

  async createImage(image: Image): Promise<ImageDocument> {
    const newImage = new this.imageModel(image);
    await newImage.save();
    return newImage;
  }
  async deleteImage(id: string): Promise<ImageDocument> {
    const image = await this.imageModel.findByIdAndDelete(id);
    if (!image) {
      throw new Error('Image not found');
    }
    return image;
  }

  // --- NUEVA FUNCIÓN AÑADIDA ---
  /**
   * Actualiza la configuración de privacidad de una imagen.
   * Requisito: "Guardar la configuración de privacidad en el servidor."
   */
  async updatePrivacy(imageId: string, newPrivacy: string): Promise<ImageDocument> {
    // Requisito: "Validar la opción de privacidad seleccionada"
    const validPrivacyOptions = ['Solo yo', 'Amigos', 'Público'];
    if (!validPrivacyOptions.includes(newPrivacy)) {
      throw new BadRequestException('Opción de privacidad no válida');
    }

    const updatedImage = await this.imageModel.findByIdAndUpdate(
      imageId,
      { $set: { privacy: newPrivacy } },
      { new: true },
    );

    if (!updatedImage) {
      throw new NotFoundException('Imagen no encontrada');
    }
    return updatedImage;
  }
}