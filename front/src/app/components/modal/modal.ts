import { Component, HostListener, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  protected modal = inject(ModalService);

  // Cerrar con la tecla Escape
  @HostListener('document:keydown.escape')
  alPresionarEscape() {
    if (this.modal.datos()) this.modal.cerrar();
  }
}
