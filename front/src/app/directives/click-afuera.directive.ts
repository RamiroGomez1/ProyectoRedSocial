import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({ selector: '[appClickAfuera]' })
export class ClickAfueraDirective {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  appClickAfuera = output<void>();

  @HostListener('document:click', ['$event'])
  alHacerClick(evento: MouseEvent) {
    const destino = evento.target as Node | null;
    if (!destino) return;
    if (this.elemento.nativeElement.contains(destino)) return;
    this.appClickAfuera.emit();
  }
}
