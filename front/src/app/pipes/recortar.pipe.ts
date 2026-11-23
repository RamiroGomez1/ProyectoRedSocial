import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'recortar' })
export class RecortarPipe implements PipeTransform {
  transform(texto: string | null | undefined, largo = 60): string {
    if (!texto) return '';
    const limpio = texto.trim();
    if (limpio.length <= largo) return limpio;
    return `${limpio.slice(0, largo).trimEnd()}…`;
  }
}
