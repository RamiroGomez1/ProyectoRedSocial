import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Modal } from './components/modal/modal';
import { Cargando } from './components/cargando/cargando';
import { AuthService } from './services/auth.service';
import { SesionService } from './services/sesion.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal, Cargando],
  template: `
    @if (auth.verificando()) {
      <app-cargando />
    } @else {
      <app-navbar />
      <main>
        <router-outlet />
      </main>
    }
    <app-modal />
  `,
})
export class App implements OnInit {
  protected auth = inject(AuthService);
  protected sesion = inject(SesionService);
  private router = inject(Router);

  ngOnInit() {
    const habiaToken = !!this.auth.token();

    this.auth.verificarSesion().subscribe((usuario) => {
      if (habiaToken && !usuario) this.router.navigate(['/login']);
    });
  }
}
