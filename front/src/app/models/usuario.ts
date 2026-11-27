export type Perfil = 'usuario' | 'administrador';

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
  token: string;
}

export interface RespuestaToken {
  mensaje: string;
  token: string;
}

export type PerfilPublico = Omit<Usuario, 'correo'>;

export interface RespuestaPerfilPublico {
  usuario: PerfilPublico;
}

export interface RespuestaPerfil {
  mensaje?: string;
  usuario: Usuario;
}
