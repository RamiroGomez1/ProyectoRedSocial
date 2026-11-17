import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Avatar } from '../avatar/avatar';
import { Comentario, Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, Avatar],
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
}
