import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { Ingreso, IngresoSchema } from './schemas/ingreso.schema';
import {
  VisitaPerfil,
  VisitaPerfilSchema,
} from './schemas/visita-perfil.schema';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Ingreso.name, schema: IngresoSchema },
      { name: VisitaPerfil.name, schema: VisitaPerfilSchema },
    ]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
