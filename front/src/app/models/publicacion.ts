export interface Comentario {
  autor: string;
  mensaje: string;
  fecha: string;
}

export interface Publicacion {
  id: string;
  autor: {
    nombre: string;
    nombreUsuario: string;
  };
  titulo: string;
  mensaje: string;
  imagen?: string;
  fecha: string;
  meGusta: number;
  leDiMeGusta: boolean;
  comentarios: Comentario[];
}
