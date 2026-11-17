import { Component } from '@angular/core';

@Component({
  selector: 'app-cargando',
  template: `
    <div class="pantalla">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>
  `,
  styles: `
    .pantalla {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: var(--texto-suave);
      font-weight: 600;
    }

    .spinner {
      width: 38px;
      height: 38px;
      border: 3px solid var(--borde);
      border-top-color: var(--primario);
      border-radius: 50%;
      animation: girar 0.7s linear infinite;
    }

    p {
      margin: 0;
    }
  `,
})
export class Cargando {}
