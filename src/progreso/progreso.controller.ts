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
} from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard) // Proteger todas las rutas de este controlador
@Controller('progreso')
export class ProgresoController {
  constructor(private readonly progresoService: ProgresoService) {}

  /**
   * Requisito: "Crear un servicio para subir fotos"
   * Requisito Frontend: "Límite de 5 imágenes por sesión"
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5)) // 'files' es el key, 5 es el límite
  uploadFiles(
    @CurrentUser() user: User,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // Requisito: "Validar formato y tamaño"
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5 MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), // JPG, PNG
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    // Requisito: "Responder con mensajes claros"
    // CORRECCIÓN: Convertir ObjectId a string
    return this.progresoService.addFotosToProgreso(user._id.toString(), files);
  }

  /**
   * Requisito: "Crear un servicio para listar fotos de un usuario"
   */
  @Get()
  getProgreso(@CurrentUser() user: User) {
    // CORRECCIÓN: Convertir ObjectId a string
    return this.progresoService.getProgresoForUser(user._id.toString());
  }

  /**
   * Requisito: "Crear un servicio para eliminar fotos"
   */
  @Delete('image/:id')
  deleteFoto(
    @CurrentUser() user: User,
    @Param('id') imageId: string,
  ) {
    // Requisito: "Responder con mensajes claros"
    // CORRECCIÓN: Convertir ObjectId a string
    return this.progresoService.deleteFotoFromProgreso(user._id.toString(), imageId);
  }
}