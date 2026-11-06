import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info';

export interface DatosModal {
  tipo: TipoModal;
  titulo: string;
  mensaje: string;
  textoBoton?: string;
  // Funcion opcional que se ejecuta al cerrar (ej: redirigir)
  alCerrar?: () => void;
}

// Reemplaza a alert(): cualquier componente puede abrir el modal global
@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly datos = signal<DatosModal | null>(null);

  abrir(datos: DatosModal) {
    this.datos.set(datos);
  }

  exito(titulo: string, mensaje: string, alCerrar?: () => void) {
    this.abrir({ tipo: 'exito', titulo, mensaje, alCerrar });
  }

  error(titulo: string, mensaje: string) {
    this.abrir({ tipo: 'error', titulo, mensaje });
  }

  info(titulo: string, mensaje: string) {
    this.abrir({ tipo: 'info', titulo, mensaje });
  }

  cerrar() {
    const alCerrar = this.datos()?.alCerrar;
    this.datos.set(null);
    alCerrar?.();
  }
}
