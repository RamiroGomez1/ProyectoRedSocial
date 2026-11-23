import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';

@Directive({ selector: '[appAutofoco]' })
export class AutofocoDirective implements AfterViewInit {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  demora = input(0, { alias: 'appAutofoco' });

  ngAfterViewInit() {
    setTimeout(() => this.elemento.nativeElement.focus(), Number(this.demora()) || 0);
  }
}
