import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { PayloadToken } from '../auth/interfaces/payload.interface';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { UsuariosService } from './usuarios.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

const soloImagenes = {
  limits: { fileSize: TAMANIO_MAXIMO },
  fileFilter: (req: unknown, archivo: Express.Multer.File, callback: any) => {
    if (!archivo.mimetype.startsWith('image/')) {
      return callback(
        new BadRequestException('El archivo debe ser una imagen'),
        false,
      );
    }
    callback(null, true);
  },
};

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
  @UseInterceptors(FileInterceptor('imagenPerfil', soloImagenes))
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

  @Get()
  @UseGuards(AdminGuard)
  async listar() {
    const usuarios = await this.usuariosService.listarTodos();
    return { usuarios, total: usuarios.length };
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil', soloImagenes))
  async crear(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    const usuario = await this.usuariosService.crearComoAdmin(dto, imagen);
    return { mensaje: 'Usuario creado correctamente', usuario };
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async deshabilitar(
    @Param('id', ParseMongoIdPipe) id: string,
    @UsuarioActual() admin: PayloadToken,
  ) {
    const usuario = await this.usuariosService.cambiarEstado(
      id,
      false,
      admin.sub,
    );
    return { mensaje: 'Usuario deshabilitado', usuario };
  }

  @Post(':id/alta')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async habilitar(
    @Param('id', ParseMongoIdPipe) id: string,
    @UsuarioActual() admin: PayloadToken,
  ) {
    const usuario = await this.usuariosService.cambiarEstado(
      id,
      true,
      admin.sub,
    );
    return { mensaje: 'Usuario habilitado', usuario };
  }
}
