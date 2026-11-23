import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluralizar' })
export class PluralizarPipe implements PipeTransform {
  transform(cantidad: number | null | undefined, singular: string, plural?: string): string {
    const numero = cantidad ?? 0;
    const palabra = numero === 1 ? singular : (plural ?? `${singular}s`);
    return `${numero} ${palabra}`;
  }
}
