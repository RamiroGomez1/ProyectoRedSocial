import { Component, computed, input } from '@angular/core';
import { COLORES, DatoGrafico } from './paleta';

const RADIO = 92;
const CENTRO = 104;

@Component({
  selector: 'app-grafico-torta',
  template: `
    @if (!datos().length || total() === 0) {
      <p class="vacio">No hay datos en el período elegido.</p>
    } @else {
      <div class="contenido">
        <svg viewBox="0 0 208 208" role="img" [attr.aria-label]="descripcion()">
          @if (porciones().length === 1) {
            <circle
              [attr.cx]="centro"
              [attr.cy]="centro"
              [attr.r]="radio"
              [attr.fill]="porciones()[0].color"
            >
              <title>{{ porciones()[0].etiqueta }}: {{ porciones()[0].valor }}</title>
            </circle>
          } @else {
            @for (porcion of porciones(); track $index) {
              <path [attr.d]="porcion.camino" [attr.fill]="porcion.color" class="porcion">
                <title>{{ porcion.etiqueta }}: {{ porcion.valor }} ({{ porcion.porcentaje }}%)</title>
              </path>
            }
          }
        </svg>

        <ul class="referencias">
          @for (porcion of porciones(); track $index) {
            <li>
              <span class="muestra" [style.background]="porcion.color"></span>
              <span class="nombre">{{ porcion.etiqueta }}</span>
              <strong>{{ porcion.valor }}</strong>
              <span class="ayuda">({{ porcion.porcentaje }}%)</span>
            </li>
          }
        </ul>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .contenido {
      display: flex;
      align-items: center;
      gap: 28px;
      flex-wrap: wrap;
      justify-content: center;
    }

    svg {
      width: 208px;
      height: 208px;
      flex-shrink: 0;
    }

    .porcion {
      stroke: var(--superficie);
      stroke-width: 2;
      transition: opacity 0.15s;
    }

    .porcion:hover {
      opacity: 0.82;
    }

    .referencias {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 190px;
    }

    .referencias li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .muestra {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    .nombre {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--texto-suave);
    }

    .vacio {
      text-align: center;
      color: var(--texto-suave);
      padding: 36px 0;
      margin: 0;
    }
  `,
})
export class GraficoTorta {
  datos = input.required<DatoGrafico[]>();
  titulo = input('Gráfico de torta');

  protected readonly radio = RADIO;
  protected readonly centro = CENTRO;

  protected total = computed(() =>
    this.datos().reduce((suma, dato) => suma + dato.valor, 0),
  );

  protected descripcion = computed(
    () => `${this.titulo()} con ${this.datos().length} categorías`,
  );

  protected porciones = computed(() => {
    const total = this.total();
    let angulo = -Math.PI / 2;

    return this.datos().map((dato, i) => {
      const proporcion = total ? dato.valor / total : 0;
      const anguloFinal = angulo + proporcion * Math.PI * 2;
      const camino = this.caminoDelArco(angulo, anguloFinal);
      angulo = anguloFinal;

      return {
        etiqueta: dato.etiqueta,
        valor: dato.valor,
        porcentaje: Math.round(proporcion * 100),
        color: COLORES[i % COLORES.length],
        camino,
      };
    });
  });

  private caminoDelArco(desde: number, hasta: number): string {
    const x1 = CENTRO + RADIO * Math.cos(desde);
    const y1 = CENTRO + RADIO * Math.sin(desde);
    const x2 = CENTRO + RADIO * Math.cos(hasta);
    const y2 = CENTRO + RADIO * Math.sin(hasta);
    const arcoGrande = hasta - desde > Math.PI ? 1 : 0;

    return [
      `M ${CENTRO} ${CENTRO}`,
      `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${RADIO} ${RADIO} 0 ${arcoGrande} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      'Z',
    ].join(' ');
  }
}
