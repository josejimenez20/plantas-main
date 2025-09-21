import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { User } from './schema/user.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user-request';
import { DmsService } from 'src/dms/dms.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly dmsService: DmsService,
  ) {}

  async create(data: CreateUserRequest) {
    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
      role: 'client',
    }).save();
  }

  async getUser(query: FilterQuery<User>) {
    const userDoc = await this.userModel
      .findOne(query)
      .populate('municipio')
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
        };
      }
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

async checkUserByEmail(email: string) {
  const user = await this.userModel.findOne({ email });
  if (user) {
    throw new NotFoundException('User already exists with this email');
  }
  return user;
}

  async getUsers() {
    return this.userModel.find({});
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found getUserById');
    }
    const { password, refreshToken, role, ...rest } = user.toObject();
    return rest;
  }

  async updateUser(query: FilterQuery<User>, data: UpdateQuery<User>) {
    return this.userModel.findOneAndUpdate(query, data);
  }
}
