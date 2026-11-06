/** Servicio del modal global (reemplaza a alert y confirm). */
import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info' | 'confirmar';

export interface DatosModal {
  tipo: TipoModal;
  titulo: string;
  mensaje: string;
  textoBoton?: string;
  // Funcion opcional que se ejecuta al cerrar (ej: redirigir)
  alCerrar?: () => void;
  // Solo para tipo "confirmar": se ejecuta si el usuario acepta
  alConfirmar?: () => void;
}

// Reemplaza a alert() y confirm(): cualquier componente puede abrir el modal global
@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly datos = signal<DatosModal | null>(null);

  // Abre el modal con los datos indicados.
  abrir(datos: DatosModal) {
    this.datos.set(datos);
  }

  // Modal de éxito.
  exito(titulo: string, mensaje: string, alCerrar?: () => void) {
    this.abrir({ tipo: 'exito', titulo, mensaje, alCerrar });
  }

  // Modal de error.
  error(titulo: string, mensaje: string) {
    this.abrir({ tipo: 'error', titulo, mensaje });
  }

  // Modal informativo.
  info(titulo: string, mensaje: string) {
    this.abrir({ tipo: 'info', titulo, mensaje });
  }

  // Modal con dos botones (Cancelar / Confirmar)
  confirmar(titulo: string, mensaje: string, alConfirmar: () => void, textoBoton = 'Confirmar') {
    this.abrir({ tipo: 'confirmar', titulo, mensaje, alConfirmar, textoBoton });
  }

  // Boton "Aceptar"/"Confirmar"
  aceptar() {
    const datos = this.datos();
    this.datos.set(null);
    datos?.alConfirmar?.();
    datos?.alCerrar?.();
  }

  // Cerrar sin confirmar (fondo, Escape o "Cancelar")
  cerrar() {
    const datos = this.datos();
    this.datos.set(null);
    // En un "confirmar", cerrar = cancelar: no ejecuta nada
    if (datos?.tipo !== 'confirmar') datos?.alCerrar?.();
  }
}
