import { Directive, HostListener, ElementRef, inject, input } from '@angular/core';

@Directive({ selector: '[appResaltar]' })
export class ResaltarDirective {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  color = input('rgba(155, 138, 214, 0.14)', { alias: 'appResaltar' });

  @HostListener('mouseenter')
  alEntrar() {
    this.elemento.nativeElement.style.backgroundColor = this.color();
  }

  @HostListener('mouseleave')
  alSalir() {
    this.elemento.nativeElement.style.backgroundColor = '';
  }
}
