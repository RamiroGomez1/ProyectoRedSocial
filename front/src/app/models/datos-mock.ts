import { Publicacion } from './publicacion';

// Datos de ejemplo para los mockups del Sprint 1.
// En el Sprint 2 se reemplazan por los que trae el back.
export const PUBLICACIONES_MOCK: Publicacion[] = [
  {
    id: '1',
    autor: { nombre: 'Lucía Fernández', nombreUsuario: 'lucia.fer' },
    titulo: 'Primer día en la facu',
    mensaje: 'Arrancó la cursada de Programación IV. Angular + NestJS, ¡a ver qué sale de esto!',
    imagen: 'degradado-1',
    fecha: '2026-11-03T14:20:00',
    meGusta: 24,
    leDiMeGusta: true,
    comentarios: [
      { autor: 'tomi_g', mensaje: '¡Éxitos! Vas a ver que está buenísimo.', fecha: '2026-11-03T15:00:00' },
      { autor: 'sofi.dev', mensaje: 'Yo la cursé el año pasado, cualquier cosa preguntá.', fecha: '2026-11-03T15:40:00' },
    ],
  },
  {
    id: '2',
    autor: { nombre: 'Tomás García', nombreUsuario: 'tomi_g' },
    titulo: 'Recomendación de café',
    mensaje: 'Encontré un café cerca de la estación que tiene enchufes en todas las mesas. Ideal para estudiar.',
    fecha: '2026-11-02T10:05:00',
    meGusta: 51,
    leDiMeGusta: false,
    comentarios: [
      { autor: 'lucia.fer', mensaje: 'Pasá la dirección 👀', fecha: '2026-11-02T11:12:00' },
    ],
  },
  {
    id: '3',
    autor: { nombre: 'Sofía Martínez', nombreUsuario: 'sofi.dev' },
    titulo: 'Atardecer desde la terraza',
    mensaje: 'No todo es código. Hoy el cielo estaba increíble.',
    imagen: 'degradado-2',
    fecha: '2026-11-01T19:45:00',
    meGusta: 87,
    leDiMeGusta: false,
    comentarios: [],
  },
  {
    id: '4',
    autor: { nombre: 'Martín López', nombreUsuario: 'martinl' },
    titulo: 'Busco grupo para el TP',
    mensaje: '¿Alguien de la comisión de la tarde que quiera armar grupo de estudio para el parcial?',
    fecha: '2026-10-31T09:30:00',
    meGusta: 12,
    leDiMeGusta: false,
    comentarios: [
      { autor: 'sofi.dev', mensaje: 'Yo me sumo', fecha: '2026-10-31T10:00:00' },
      { autor: 'tomi_g', mensaje: 'Yo también!', fecha: '2026-10-31T10:30:00' },
      { autor: 'lucia.fer', mensaje: 'Contá conmigo', fecha: '2026-10-31T12:15:00' },
    ],
  },
  {
    id: '5',
    autor: { nombre: 'Valentina Ruiz', nombreUsuario: 'vale.ruiz' },
    titulo: 'Mi setup nuevo',
    mensaje: 'Por fin armé el escritorio como quería. Monitor nuevo y teclado mecánico.',
    imagen: 'degradado-3',
    fecha: '2026-10-30T21:10:00',
    meGusta: 63,
    leDiMeGusta: true,
    comentarios: [
      { autor: 'martinl', mensaje: '¿Qué switches tiene el teclado?', fecha: '2026-10-30T22:00:00' },
    ],
  },
];
