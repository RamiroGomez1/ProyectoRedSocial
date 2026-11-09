import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { PayloadToken } from '../auth/interfaces/payload.interface';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { PaginacionDto } from './dto/paginacion.dto';

@UseGuards(JwtAuthGuard)
@Controller('publicaciones/:id/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(
    @Param('id', ParseMongoIdPipe) id: string,
    @Query() paginacion: PaginacionDto,
  ) {
    return this.comentariosService.listar(id, paginacion);
  }

  @Post()
  crear(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: CrearComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.crear(id, dto, usuario.sub);
  }
}
