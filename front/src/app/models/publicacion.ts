// Modelo provisorio para los mockups del Sprint 1.
// En el Sprint 2 se ajusta a lo que devuelva el back.
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
  // Sin imagen real todavia: usamos un degradado de color como "foto"
  imagen?: string;
  fecha: string;
  meGusta: number;
  leDiMeGusta: boolean;
  comentarios: Comentario[];
}
