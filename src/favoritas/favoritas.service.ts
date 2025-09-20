import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFavoritaDto } from './dto/create-favorita.dto';
import { UpdateFavoritaDto } from './dto/update-favorita.dto';
import { UsersService } from 'src/users/users.service';
import { PlantasService } from 'src/plantas/plantas.service';
import mongoose from 'mongoose';

@Injectable()
export class FavoritasService {
  constructor(
    private readonly usersService: UsersService,
    private readonly plantasService: PlantasService,
  ) { }
  
async create(createFavoritaDto: CreateFavoritaDto) {
  const [user, planta] = await Promise.all([
    this.usersService.getUserById(createFavoritaDto.userId),
    this.plantasService.findOne(createFavoritaDto.plantaId),
  ]);

  if (!planta || !user) {
    throw new NotFoundException('User or Planta not found');
  }

  // Verificar si ya está en favoritos
  const alreadyFavorite = user.favorites?.some(
    (fav) => fav instanceof mongoose.Types.ObjectId
      ? fav.equals(createFavoritaDto.plantaId) // compara correctamente ObjectId
      : fav.toString() === createFavoritaDto.plantaId, // por si viene como string
  );

  if (alreadyFavorite) {
    return {
      message: 'La planta ya está en favoritos',
    };
  }

  // Agregar a favoritos
  user.favorites = [...(user.favorites || []), planta];

  await this.usersService.updateUser(
    { _id: createFavoritaDto.userId },
    { favorites: user.favorites },
  );

  return {
    message: 'Planta añadida a favoritos',
  };
}
  findAll() {
    return `This action returns all favoritas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favorita`;
  }

  update(id: number, updateFavoritaDto: UpdateFavoritaDto) {
    return `This action updates a #${id} favorita`;
  }

  remove(id: number) {
    return `This action removes a #${id} favorita`;
  }
}
