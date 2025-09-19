import { Module } from '@nestjs/common';
import { ImgdbService } from './imgdb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule
    .forFeature([
      {
        name: Image.name,
        schema: ImageSchema,
      },
    ]),
  ],
  providers: [ImgdbService],
  exports: [ImgdbService],

})
export class ImgdbModule {}
