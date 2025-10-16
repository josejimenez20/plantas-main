import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { DmsModule } from 'src/dms/dms.module';
import { DmsService } from 'src/dms/dms.service';
import { ImgdbModule } from 'src/imgdb/imgdb.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      }
    ]),
    DmsModule,
    ImgdbModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, DmsService],
  exports: [UsersService]
})
export class UsersModule {}
