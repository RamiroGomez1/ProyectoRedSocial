/** Tipos de datos del usuario y de la respuesta de login/registro. */
export type Perfil = 'usuario' | 'administrador';

// Forma de los datos de usuario que devuelve el back
export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil: string;
  perfil: Perfil;
  activo: boolean;
  createdAt: string;
}

export interface RespuestaAuth {
  mensaje: string;
  usuario: Usuario;
  // JWT firmado por el back (vence a los 15 minutos)
  token: string;
}
