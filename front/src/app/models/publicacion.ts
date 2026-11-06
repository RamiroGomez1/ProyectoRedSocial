/** Tipos de datos de publicaciones, comentarios y respuestas del back. */
// Formas de los datos que devuelve el back para publicaciones y comentarios

export interface Autor {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string;
  autor: Autor;
  cantidadMeGusta: number;
  cantidadComentarios: number;
  // Calculado por el back segun el usuario del token
  leDiMeGusta: boolean;
  createdAt: string;
}

export interface Comentario {
  _id: string;
  mensaje: string;
  autor: Autor;
  modificado: boolean;
  createdAt: string;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface RespuestaComentarios {
  comentarios: Comentario[];
  total: number;
  offset: number;
  limit: number;
}

export interface RespuestaMeGusta {
  cantidadMeGusta: number;
  leDiMeGusta: boolean;
}
