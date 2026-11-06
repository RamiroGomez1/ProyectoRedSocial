/** Rutas de comentarios de una publicación. */
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { PayloadToken } from '../auth/interfaces/payload.interface';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { PaginacionDto } from './dto/paginacion.dto';

// Comentarios controller (dentro del modulo publicaciones).
// En el Sprint 3 se agrega el PUT para editar.
@UseGuards(JwtAuthGuard)
@Controller('publicaciones/:id/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /api/publicaciones/:id/comentarios?offset=0&limit=5
  @Get()
  listar(
    @Param('id', ParseMongoIdPipe) id: string,
    @Query() paginacion: PaginacionDto,
  ) {
    return this.comentariosService.listar(id, paginacion);
  }

  // POST /api/publicaciones/:id/comentarios  { mensaje } -> 201
  @Post()
  crear(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: CrearComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.crear(id, dto, usuario.sub);
  }
}
