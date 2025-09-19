import { Injectable } from '@nestjs/common';
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
}
