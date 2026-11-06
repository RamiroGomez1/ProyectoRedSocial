import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    return this.usuarioModel.create(datos);
  }

  // Devuelve que campo esta repetido (o null si ninguno)
  async campoRepetido(
    correo: string,
    nombreUsuario: string,
  ): Promise<'correo' | 'nombreUsuario' | null> {
    const existente = await this.usuarioModel.findOne({
      $or: [{ correo: correo.toLowerCase() }, { nombreUsuario }],
    });
    if (!existente) return null;
    return existente.correo === correo.toLowerCase()
      ? 'correo'
      : 'nombreUsuario';
  }

  // Busca por correo O por nombre de usuario, trayendo tambien el password
  buscarParaLogin(identificador: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel
      .findOne({
        $or: [
          { correo: identificador.toLowerCase() },
          { nombreUsuario: identificador },
        ],
      })
      .select('+password');
  }
}
