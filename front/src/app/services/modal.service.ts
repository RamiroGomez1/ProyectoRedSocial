import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info' | 'confirmar';

export interface DatosModal {
  tipo: TipoModal;
  titulo: string;
  mensaje: string;
  textoBoton?: string;
  alCerrar?: () => void;
  alConfirmar?: () => void;
}

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

  confirmar(titulo: string, mensaje: string, alConfirmar: () => void, textoBoton = 'Confirmar') {
    this.abrir({ tipo: 'confirmar', titulo, mensaje, alConfirmar, textoBoton });
  }

  aceptar() {
    const datos = this.datos();
    this.datos.set(null);
    datos?.alConfirmar?.();
    datos?.alCerrar?.();
  }

  cerrar() {
    const datos = this.datos();
    this.datos.set(null);
    if (datos?.tipo !== 'confirmar') datos?.alCerrar?.();
  }
}
