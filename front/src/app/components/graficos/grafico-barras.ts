import { Component, computed, input } from '@angular/core';
import { COLORES, DatoGrafico } from './paleta';

const ANCHO = 620;
const ALTO = 300;
const MARGEN = { arriba: 24, derecha: 16, abajo: 56, izquierda: 44 };

@Component({
  selector: 'app-grafico-barras',
  template: `
    @if (!datos().length) {
      <p class="vacio">No hay datos en el período elegido.</p>
    } @else {
      <svg
        [attr.viewBox]="'0 0 ' + ancho + ' ' + alto"
        role="img"
        [attr.aria-label]="descripcion()"
      >
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

        @for (barra of barras(); track $index) {
          <rect
            class="barra"
            [attr.x]="barra.x"
            [attr.y]="barra.y"
            [attr.width]="barra.ancho"
            [attr.height]="barra.alto"
            [attr.fill]="barra.color"
            rx="6"
          >
            <title>{{ barra.etiqueta }}: {{ barra.valor }}</title>
          </rect>
          <text class="valor" [attr.x]="barra.centro" [attr.y]="barra.y - 7" text-anchor="middle">
            {{ barra.valor }}
          </text>
          <text class="eje" [attr.x]="barra.centro" [attr.y]="alto - 30" text-anchor="middle">
            {{ barra.etiqueta }}
          </text>
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

    .valor {
      fill: var(--texto);
      font-size: 11px;
      font-weight: 700;
    }

    .barra {
      transition: opacity 0.15s;
    }

    .barra:hover {
      opacity: 0.8;
    }

    .vacio {
      text-align: center;
      color: var(--texto-suave);
      padding: 36px 0;
      margin: 0;
    }
  `,
})
export class GraficoBarras {
  datos = input.required<DatoGrafico[]>();
  titulo = input('Gráfico de barras');

  protected readonly ancho = ANCHO;
  protected readonly alto = ALTO;
  protected readonly margenIzquierda = MARGEN.izquierda;
  protected readonly margenDerecha = MARGEN.derecha;

  protected descripcion = computed(
    () => `${this.titulo()} con ${this.datos().length} valores`,
  );

  private maximo = computed(() =>
    Math.max(1, ...this.datos().map((d) => d.valor)),
  );

  private alturaUtil = computed(() => ALTO - MARGEN.arriba - MARGEN.abajo);

  protected grilla = computed(() => {
    const maximo = this.maximo();
    const pasos = 4;
    return Array.from({ length: pasos + 1 }, (unused, i) => {
      const valor = Math.round((maximo / pasos) * i);
      const y = MARGEN.arriba + this.alturaUtil() * (1 - i / pasos);
      return { valor, y };
    });
  });

  protected barras = computed(() => {
    const datos = this.datos();
    const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
    const paso = anchoUtil / datos.length;
    const anchoBarra = Math.min(64, paso * 0.62);

    return datos.map((dato, i) => {
      const alto = (dato.valor / this.maximo()) * this.alturaUtil();
      const centro = MARGEN.izquierda + paso * i + paso / 2;
      return {
        etiqueta: dato.etiqueta,
        valor: dato.valor,
        ancho: anchoBarra,
        alto: Math.max(2, alto),
        x: centro - anchoBarra / 2,
        y: MARGEN.arriba + this.alturaUtil() - Math.max(2, alto),
        centro,
        color: COLORES[i % COLORES.length],
      };
    });
  });
}
