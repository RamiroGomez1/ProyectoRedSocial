import { Perfil } from '../../usuarios/schemas/usuario.schema';

export interface PayloadToken {
  sub: string;
  nombreUsuario: string;
  perfil: Perfil;
}
