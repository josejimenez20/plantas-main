import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as UUID4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DmsService {
  private readonly uploadFolder: string = path.resolve(
    process.cwd(),
    'files',
    'upload',
  );
  private readonly URL_SERVER: string = this.configService.get('SERVER_URL');
  private readonly client: S3Client;
  private readonly bucketName: string =
    this.configService.get('S3_BUCKET_NAME');

  constructor(private readonly configService: ConfigService) {
    const s3_region: string = this.configService.get('S3_REGION');
    const s3_access_key: string = this.configService.get('S3_ACCESS_KEY');
    const s3_secret_key: string = this.configService.get(
      'S3_SECRET_ACCESS_KEY',
    );

    if (!s3_region) throw new Error('S3_REGION is not defined');

    this.client = new S3Client({
      region: s3_region,
      credentials: {
        accessKeyId: s3_access_key,
        secretAccessKey: s3_secret_key,
      },
      forcePathStyle: false,
      endpoint: `https://s3.${s3_region}.wasabisys.com`,
    });

    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder, { recursive: true });
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async saveLocalFile({
    file,
    isPublic = false,
  }: {
    file: Express.Multer.File;
    isPublic?: boolean;
  }): Promise<{
    url: string;
    key: string;
    isPublic: boolean;
  }> {
    try {
      const fileExtension = path.extname(file.originalname);
      const key = `${UUID4()}${fileExtension}`;
      const filePath = path.join(this.uploadFolder, key);
      fs.writeFileSync(filePath, file.buffer);

      return {
        url: `${this.URL_SERVER}/files/upload/${key}`,
        key,
        isPublic,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async uploadSingleFile({
    file,
    isPublic = true,
  }: {
    file: Express.Multer.File;
    isPublic: boolean;
  }): Promise<{
    url: string;
    key: string;
    isPublic: boolean;
  }> {
    try {
      const key = `${UUID4()}`;
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: isPublic ? 'public-read' : 'private',
          Metadata: {
            originalName: file.originalname,
          },
        });

        await this.client.send(command);
      } catch (e) {
        throw new InternalServerErrorException(e);
      }

      return {
        url: isPublic
          ? (await this.getFileUrl(key)).url
          : (await this.getPresignedUrl(key)).url,
        key,
        isPublic,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFileUrl(key: string): Promise<{ url: string }> {
    return await { url: `https://${this.bucketName}.s3.wasabisys.com/${key}` };
  }

  async getPresignedUrl(key: string): Promise<{ url: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 30 * 24 * 60,
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteFile(key: string): Promise<{ message: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
