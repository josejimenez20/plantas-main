import { ConflictException, ConsoleLogger, Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { User } from './schema/user.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user-request';
import { DmsService } from 'src/dms/dms.service';
import { ImgdbService } from 'src/imgdb/imgdb.service';
import { ImageType } from 'src/imgdb/dto/image.dto';
import { ImageDocument } from 'src/imgdb/schemas/image.schema';
import { title } from 'process';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly dmsService: DmsService,
    private readonly imgdbService: ImgdbService,
  ) {}

  async create(data: CreateUserRequest) {
    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
      role: 'client',
    }).save();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user = new this.userModel(userData);
      const savedUser = await user.save();
      return savedUser;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  async findUserAuth(filter: any): Promise<User | null> {
    try {
      const user = await this.userModel
        .findOne({ ...filter, isDeleted: false })
        .populate('municipio')
        .exec();
      return user;
    } catch (error) {
      console.error('Error en findUser:', error);
      return null;
    }
  }
  async findUser(filter: any): Promise<User | null> {
    try {
      const user = await this.userModel
        .findOne({ ...filter, isDeleted: false })
        .populate('municipio')
        .exec();
      return user;
    } catch (error) {
      console.error('Error en findUser:', error);
      return null;
    }
  }

  async getUser(query: FilterQuery<User>) {
    const userDoc = await this.userModel
      .findOne({ ...query, isDeleted: false })
      .populate('municipio')
      .populate('pictureMongo')
      .populate({
        path: 'favorites',
        populate: { path: 'imagen' },
      });

    if (!userDoc) {
      throw new NotFoundException('User not found!');
    }

    const user = userDoc.toObject();

    for (const planta of user.favorites || []) {
      if (planta.imagen?._id) {
        const result = await this.dmsService.getPresignedUrl(planta.imagen._id);

        planta.imagen = {
          _id: planta.imagen._id,
          title: planta.imagen.title,
          url: result.url,
          isPublic: planta.imagen.isPublic ?? false,
          privacy: planta.imagen.privacy
        };
      }
    }

    if (user.pictureMongo?._id) {
      const result = await this.dmsService.getPresignedUrl(user.pictureMongo._id);
      
      user.pictureMongo = {
        _id: user.pictureMongo._id,
        title: user.pictureMongo.title,
        url: result.url,
        isPublic: user.pictureMongo.isPublic ?? false,
        privacy: user.pictureMongo.privacy
      };
    }

    return user;
  }

  async checkUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email, isDeleted: false });
    if (user) {
      throw new NotFoundException('User already exists with this email');
    }
    return user;
  }

  async getUsers() {
    return this.userModel.find({ isDeleted: false });
  }

  async getUserById(id: string) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false });

    if (!user) {
      throw new NotFoundException('User not found getUserById');
    }
    const { password, refreshToken, role, ...rest } = user.toObject();
    return rest;
  }

  async updateUser(
    query: FilterQuery<User>,
    data: UpdateQuery<User>,
    image?: Express.Multer.File,
  ) {
    // Requisito #2: Validar que el nombre no esté vacío si se proporciona
    if (data.name) {
      if (typeof data.name !== 'string' || data.name.trim() === '') {
        throw new BadRequestException('El nombre no puede estar vacío.'); // Requisito #2
      }

      // Requisito #3: Consultar que el nombre no esté en uso
      const existingUser = await this.userModel.findOne({
        name: data.name,
        _id: { $ne: query._id }, // Excluir al usuario actual de la búsqueda
        isDeleted: false,
      });

      if (existingUser) {
        throw new ConflictException('El nombre ya está en uso por otro usuario.'); // Requisito #6
      }
    }



    if (image) {
      console.log("Editando con imagen")
      const user = await this.userModel.findOne({
        ...query
      });
      const newImage = await this.getImage(image);
      data.pictureMongo = newImage._id;
      data.picture = newImage._id;

      return this.userModel.findOneAndUpdate(
        { ...query, isDeleted: false },
        data,
        { new: true },
      );
    }
    return this.userModel.findOneAndUpdate(
      { ...query, isDeleted: false },
      data,
      { new: true },
    );
  }

  async softDeleteUser(id: string) {
  const user = await this.userModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } }, 
    { new: true },
  );
// ...
return { message: 'User has been deleted successfully' };
}


  async getImage(image: Express.Multer.File): Promise<ImageDocument> {
    const imageInfo: ImageType = await this.dmsService.uploadSingleFile({
      file: image,
      isPublic: false,
    });

    const imageDB = {
      _id: imageInfo.key,
      url: imageInfo.url,
      isPublic: imageInfo.isPublic,
      title: image.originalname,
      privacy: 'Solo yo', // Default privacy al subir
    };

    const newImage = await this.imgdbService.createImage(imageDB);

    return newImage;
  }

  async putImage(
    image: Express.Multer.File,
    id: string,
  ): Promise<ImageDocument> {
    const deleteImage = await this.dmsService.deleteFile(id);
    if (!deleteImage) throw new ConflictException('Imagen no encontrada');

    const imageInfo: ImageType = await this.dmsService.uploadSingleFile({
      file: image,
      isPublic: false,
    });

    const imageDB = {
      _id: imageInfo.key,
      url: imageInfo.url,
      isPublic: imageInfo.isPublic,
      title: image.originalname,
      privacy: 'Solo yo', // Default privacy al subir
    };

    const newImage = await this.imgdbService.createImage(imageDB);

    return newImage;
  }
}
