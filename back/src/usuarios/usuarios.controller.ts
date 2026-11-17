import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { PayloadToken } from '../auth/interfaces/payload.interface';
import { UsuariosService } from './usuarios.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('mi-perfil')
  async miPerfil(@UsuarioActual() usuario: PayloadToken) {
    const encontrado = await this.usuariosService.buscarPorId(usuario.sub);
    return { usuario: encontrado };
  }

  @Patch('mi-perfil')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      limits: { fileSize: TAMANIO_MAXIMO },
      fileFilter: (req, archivo, callback) => {
        if (!archivo.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('El archivo debe ser una imagen'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async actualizarMiPerfil(
    @Body() dto: ActualizarPerfilDto,
    @UsuarioActual() usuario: PayloadToken,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    const actualizado = await this.usuariosService.actualizarPerfil(
      usuario.sub,
      dto,
      imagen,
    );
    return {
      mensaje: 'Perfil actualizado correctamente',
      usuario: actualizado,
    };
  }
}
