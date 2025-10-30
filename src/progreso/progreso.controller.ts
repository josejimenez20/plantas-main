import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Patch, // <-- Importar Patch
  Body, // <-- Importar Body
} from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('progreso')
export class ProgresoController {
  constructor(private readonly progresoService: ProgresoService) {}

  // ... (uploadFiles - sin cambios)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadFiles(
    @CurrentUser() user: User,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5 MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), // JPG, PNG
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.progresoService.addFotosToProgreso(user._id.toString(), files);
  }
  
  // ... (getProgreso - sin cambios)
  @Get()
  getProgreso(@CurrentUser() user: User) {
    return this.progresoService.getProgresoForUser(user._id.toString());
  }

  // ... (deleteFoto - sin cambios)
  @Delete('image/:id')
  deleteFoto(
    @CurrentUser() user: User,
    @Param('id') imageId: string,
  ) {
    return this.progresoService.deleteFotoFromProgreso(user._id.toString(), imageId);
  }

  // --- NUEVO ENDPOINT AÑADIDO ---
  /**
   * Requisito: "Permitir cambiar la privacidad de una foto ya publicada."
   */
  @Patch('image/:id/privacy')
  updatePrivacy(
    @CurrentUser() user: User,
    @Param('id') imageId: string,
    @Body('privacy') privacy: string, // Espera un body { "privacy": "Público" }
  ) {
    // Requisito: "Enviar al frontend mensajes claros de éxito o error."
    return this.progresoService.updateFotoPrivacy(
      user._id.toString(),
      imageId,
      privacy,
    );
  }
}