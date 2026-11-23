import { Component, computed, input } from '@angular/core';
import { DatoGrafico } from './paleta';

const ANCHO = 620;
const ALTO = 280;
const MARGEN = { arriba: 24, derecha: 18, abajo: 48, izquierda: 44 };

@Component({
  selector: 'app-grafico-lineas',
  template: `
    @if (!datos().length) {
      <p class="vacio">No hay datos en el período elegido.</p>
    } @else {
      <svg
        [attr.viewBox]="'0 0 ' + ancho + ' ' + alto"
        role="img"
        [attr.aria-label]="descripcion()"
      >
        <defs>
          <linearGradient id="degradadoLinea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#9b8ad6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#9b8ad6" stop-opacity="0" />
          </linearGradient>
        </defs>

        @for (linea of grilla(); track $index) {
          <line
            class="grilla"
            [attr.x1]="margenIzquierda"
            [attr.x2]="ancho - margenDerecha"
            [attr.y1]="linea.y"
            [attr.y2]="linea.y"
          />
          <text class="eje" [attr.x]="margenIzquierda - 10" [attr.y]="linea.y + 4" text-anchor="end">
            {{ linea.valor }}
          </text>
        }

        <path class="area" [attr.d]="area()" fill="url(#degradadoLinea)" />
        <polyline class="linea" [attr.points]="linea()" />

        @for (punto of puntos(); track $index) {
          <circle class="punto" [attr.cx]="punto.x" [attr.cy]="punto.y" r="4">
            <title>{{ punto.etiqueta }}: {{ punto.valor }}</title>
          </circle>
          @if (punto.mostrarEtiqueta) {
            <text class="eje" [attr.x]="punto.x" [attr.y]="alto - 22" text-anchor="middle">
              {{ punto.etiqueta }}
            </text>
          }
        }
      </svg>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: auto;
      overflow: visible;
    }

    .grilla {
      stroke: var(--borde);
      stroke-width: 1;
    }

    .eje {
      fill: var(--texto-suave);
      font-size: 11px;
      font-weight: 600;
    }

    .linea {
      fill: none;
      stroke: #9b8ad6;
      stroke-width: 2.5;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .punto {
      fill: #f7a28f;
      stroke: var(--superficie);
      stroke-width: 2;
    }

    .vacio {
      text-align: center;
      color: var(--texto-suave);
      padding: 36px 0;
      margin: 0;
    }
  `,
})
export class GraficoLineas {
  datos = input.required<DatoGrafico[]>();
  titulo = input('Gráfico de líneas');

  protected readonly ancho = ANCHO;
  protected readonly alto = ALTO;
  protected readonly margenIzquierda = MARGEN.izquierda;
  protected readonly margenDerecha = MARGEN.derecha;

  protected descripcion = computed(
    () => `${this.titulo()} con ${this.datos().length} puntos`,
  );

  private maximo = computed(() =>
    Math.max(1, ...this.datos().map((d) => d.valor)),
  );

  private alturaUtil = computed(() => ALTO - MARGEN.arriba - MARGEN.abajo);

  protected grilla = computed(() => {
    const maximo = this.maximo();
    const pasos = 4;
    return Array.from({ length: pasos + 1 }, (unused, i) => ({
      valor: Math.round((maximo / pasos) * i),
      y: MARGEN.arriba + this.alturaUtil() * (1 - i / pasos),
    }));
  });

  protected puntos = computed(() => {
    const datos = this.datos();
    const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
    const paso = datos.length > 1 ? anchoUtil / (datos.length - 1) : 0;
    const cada = Math.ceil(datos.length / 7);

    return datos.map((dato, i) => ({
      etiqueta: dato.etiqueta,
      valor: dato.valor,
      x: datos.length > 1 ? MARGEN.izquierda + paso * i : ANCHO / 2,
      y:
        MARGEN.arriba +
        this.alturaUtil() * (1 - dato.valor / this.maximo()),
      mostrarEtiqueta: i % cada === 0 || i === datos.length - 1,
    }));
  });

  protected linea = computed(() =>
    this.puntos()
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' '),
  );

  protected area = computed(() => {
    const puntos = this.puntos();
    if (!puntos.length) return '';
    const base = MARGEN.arriba + this.alturaUtil();
    const primero = puntos[0];
    const ultimo = puntos[puntos.length - 1];

    const recorrido = puntos
      .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    return `M ${primero.x.toFixed(1)} ${base} ${recorrido} L ${ultimo.x.toFixed(1)} ${base} Z`;
  });
}
