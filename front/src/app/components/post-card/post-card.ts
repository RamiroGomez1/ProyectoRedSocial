import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../avatar/avatar';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { PluralizarPipe } from '../../pipes/pluralizar.pipe';
import { Comentario, Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, Avatar, TiempoRelativoPipe, PluralizarPipe],
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
