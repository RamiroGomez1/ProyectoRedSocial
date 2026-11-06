import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Modal } from './components/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <!-- Un unico modal para toda la app, se controla con ModalService -->
    <app-modal />
  `,
})
export class App {}
