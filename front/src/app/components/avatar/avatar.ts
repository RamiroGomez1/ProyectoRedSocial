import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  host: {
    '[style.width.px]': 'tamanio()',
    '[style.height.px]': 'tamanio()',
    '[style.font-size.px]': 'tamanio() * 0.38',
    '[attr.title]': 'nombreCompleto() || null',
  },
  template: `
    @if (url()) {
      <img [src]="url()" [alt]="alt()" [width]="tamanio()" [height]="tamanio()" />
    } @else if (iniciales()) {
      <span class="iniciales">{{ iniciales() }}</span>
    } @else {
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.07 0 7.5 2.2 7.5 4.9V21h-15v-2.1C4.5 16.2 7.93 14 12 14Z"
        />
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--marca);
      color: #fff;
      font-weight: 800;
      letter-spacing: -0.02em;
      user-select: none;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    svg {
      width: 62%;
      height: 62%;
      opacity: 0.9;
    }
  `,
})
export class Avatar {
  url = input<string | null>('');
  nombre = input('');
  apellido = input('');
  tamanio = input(42);

  protected nombreCompleto = computed(() =>
    `${this.nombre()} ${this.apellido()}`.trim(),
  );

  protected iniciales = computed(() => {
    const letras = `${this.nombre().charAt(0)}${this.apellido().charAt(0)}`;
    return letras.trim().toUpperCase();
  });

  protected alt = computed(() =>
    this.nombreCompleto() ? `Foto de ${this.nombreCompleto()}` : 'Foto de perfil',
  );
}
