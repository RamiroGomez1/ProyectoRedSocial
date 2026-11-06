/** Forma de los datos que viajan dentro del token JWT. */
import { Perfil } from '../../usuarios/schemas/usuario.schema';

// Lo que guardamos adentro del token JWT.
// Solo datos que se pueden hacer publicos (el payload se puede leer sin la clave).
export interface PayloadToken {
  sub: string; // id del usuario
  nombreUsuario: string;
  perfil: Perfil;
}
