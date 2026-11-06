import { Controller } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';

// Las rutas de publicaciones (alta, listado, baja, me gusta) van en el Sprint 2
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}
}
