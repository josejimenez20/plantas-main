import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user-request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './schema/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: CreateUserRequest) {
    await this.usersService.create(request);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(@CurrentUser() user: User) {
    return this.usersService.getUsers();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @CurrentUser() user: User,
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const fullUser = await this.usersService.getUser({ _id: user._id });

    const { password, refreshToken, ...safeUser } = fullUser;
    return safeUser;
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
            message: 'File too large. Max size is 5MB',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body() data: Partial<User>,
  ) {
    return this.usersService.updateUser({ _id: user._id }, data, file);
  }
}
