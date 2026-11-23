import { Pipe, PipeTransform } from '@angular/core';

const MINUTO = 60;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const SEMANA = 7 * DIA;

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(valor: string | Date | null | undefined): string {
    if (!valor) return '';

    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return '';

    const segundos = Math.floor((Date.now() - fecha.getTime()) / 1000);

    if (segundos < 0) return 'recién';
    if (segundos < MINUTO) return 'hace instantes';

    if (segundos < HORA) {
      const minutos = Math.floor(segundos / MINUTO);
      return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }

    if (segundos < DIA) {
      const horas = Math.floor(segundos / HORA);
      return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }

    if (segundos < SEMANA) {
      const dias = Math.floor(segundos / DIA);
      return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    }

    return fecha.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
