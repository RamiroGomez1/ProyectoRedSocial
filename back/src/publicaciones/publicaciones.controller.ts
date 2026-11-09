import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { PayloadToken } from '../auth/interfaces/payload.interface';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';

@UseGuards(JwtAuthGuard)
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, archivo, callback) => {
        if (!archivo.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('El archivo debe ser una imagen'), false);
        }
        callback(null, true);
      },
    }),
  )
  crear(
    @Body() dto: CrearPublicacionDto,
    @UsuarioActual() usuario: PayloadToken,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(dto, usuario.sub, imagen);
  }

  @Get()
  listar(
    @Query() query: ListarPublicacionesDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.listar(query, usuario.sub);
  }

  @Delete(':id')
  eliminar(
    @Param('id', ParseMongoIdPipe) id: string,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(
    @Param('id', ParseMongoIdPipe) id: string,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.darMeGusta(id, usuario.sub);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(
    @Param('id', ParseMongoIdPipe) id: string,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.quitarMeGusta(id, usuario.sub);
  }
}
