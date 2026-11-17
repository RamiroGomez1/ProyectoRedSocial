import { Injectable, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

const MINUTOS_PARA_AVISAR = 10;

@Injectable({ providedIn: 'root' })
export class SesionService {
  private auth = inject(AuthService);
  private modal = inject(ModalService);
  private router = inject(Router);

  private temporizador: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const token = this.auth.token();
      this.cancelarAviso();
      if (token) this.programarAviso();
    });
  }

  private programarAviso() {
    this.temporizador = setTimeout(
      () => this.avisarVencimiento(),
      MINUTOS_PARA_AVISAR * 60 * 1000,
    );
  }

  private avisarVencimiento() {
    this.modal.confirmar(
      'Tu sesión está por vencer',
      'Te quedan 5 minutos de sesión. ¿Querés extenderla?',
      () => this.extender(),
      'Extender sesión',
      false,
    );
  }

  private extender() {
    this.auth.refrescarToken().subscribe({
      next: () =>
        this.modal.exito('Sesión extendida', 'Tenés 15 minutos más para seguir navegando.'),
      error: () => {
        this.auth.cerrarSesion();
        this.modal.info('Tu sesión expiró', 'Volvé a iniciar sesión para continuar.');
        this.router.navigate(['/login']);
      },
    });
  }

  private cancelarAviso() {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = null;
  }
}
