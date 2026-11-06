import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../models/publicacion';

// Cada publicacion es un componente (lo pide la consigna del Sprint 2)
@Component({
  selector: 'app-post-card',
  imports: [DatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  publicacion = input.required<Publicacion>();
  mostrarComentarios = input(false);

  // Avisa al padre que se toco "me gusta"
  meGusta = output<Publicacion>();

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((parte) => parte[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
