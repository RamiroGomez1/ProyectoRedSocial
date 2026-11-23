import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { EstadisticasService } from './estadisticas.service';
import { RangoFechasDto } from './dto/rango-fechas.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() query: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(query);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() query: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(query);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() query: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(query);
  }
}
