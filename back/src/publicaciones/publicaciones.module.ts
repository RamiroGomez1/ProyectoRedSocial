import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { MeGusta, MeGustaSchema } from './schemas/me-gusta.schema';
import { Ingreso, IngresoSchema } from '../usuarios/schemas/ingreso.schema';
import {
  VisitaPerfil,
  VisitaPerfilSchema,
} from '../usuarios/schemas/visita-perfil.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: MeGusta.name, schema: MeGustaSchema },
      { name: Ingreso.name, schema: IngresoSchema },
      { name: VisitaPerfil.name, schema: VisitaPerfilSchema },
    ]),
  ],
  controllers: [
    PublicacionesController,
    ComentariosController,
    EstadisticasController,
  ],
  providers: [PublicacionesService, ComentariosService, EstadisticasService],
})
export class PublicacionesModule {}
