/** Módulo de usuarios: registra el modelo Usuario y exporta su servicio. */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  // Registra el modelo Usuario para poder inyectarlo con @InjectModel
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  // Se exporta para que AuthModule lo pueda usar
  exports: [UsuariosService],
})
export class UsuariosModule {}
