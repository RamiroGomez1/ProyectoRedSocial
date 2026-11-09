import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comentario, Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  publicacion = input.required<Publicacion>();
  comentarios = input<Comentario[] | null>(null);
  puedeEliminar = input(false);
  procesando = input(false);

  meGusta = output<Publicacion>();
  eliminar = output<Publicacion>();

  iniciales(nombre: string, apellido: string): string {
    return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
  }
}
