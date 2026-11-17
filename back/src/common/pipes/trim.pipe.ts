import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(valor: unknown): unknown {
    if (typeof valor === 'string') return valor.trim();

    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
      return valor;
    }

    const objeto = valor as Record<string, unknown>;
    for (const [clave, contenido] of Object.entries(objeto)) {
      if (typeof contenido === 'string') objeto[clave] = contenido.trim();
    }
    return objeto;
  }
}
