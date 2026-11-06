/** Tarjeta que muestra una publicación. */
import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comentario, Publicacion } from '../../models/publicacion';

// Cada publicacion es un componente (lo pide la consigna del Sprint 2).
// No llama al back: solo muestra y AVISA al padre con outputs.
@Component({
  selector: 'app-post-card',
  imports: [DatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  publicacion = input.required<Publicacion>();
  // Si viene, se muestran debajo (se usa en Mi perfil)
  comentarios = input<Comentario[] | null>(null);
  // El padre decide si se muestra el boton eliminar (autor o admin)
  puedeEliminar = input(false);
  // Mientras se procesa el me gusta, se deshabilita el boton
  procesando = input(false);

  meGusta = output<Publicacion>();
  eliminar = output<Publicacion>();

  // Iniciales del autor, para cuando no tiene foto.
  iniciales(nombre: string, apellido: string): string {
    return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
  }
}
