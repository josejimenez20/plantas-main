import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DmsService } from './dms.service';
@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
            message: 'File too large. Max size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('isPublic') isPublic: string,
  ): Promise<{
    url: string;
    key: string;
    isPublic: boolean;
  }> {
    const isPublicBool = isPublic === 'true' ? true : false;

    return this.dmsService.uploadSingleFile({ file, isPublic: isPublicBool });
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string): Promise<{ url: string }> {
    return this.dmsService.getFileUrl(key);
  }

  @Get('/signed-url/:key')
  async getPresignedUrl(@Param('key') key: string): Promise<{ url: string }> {
    return this.dmsService.getPresignedUrl(key);
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string): Promise<{ message: string }> {
    return this.dmsService.deleteFile(key);
  }
}
