export interface RespuestaEstadistica<T> {
  desde: string;
  hasta: string;
  datos: T[];
}

export interface PublicacionesPorUsuario {
  usuarioId: string;
  nombreUsuario: string;
  nombre: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}

export interface RangoFechas {
  desde: string;
  hasta: string;
}
