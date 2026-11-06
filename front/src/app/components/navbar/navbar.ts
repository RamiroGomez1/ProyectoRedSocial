/** Barra de navegación superior. */
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected auth = inject(AuthService);
  private router = inject(Router);

  // Menu desplegable en celulares
  protected menuAbierto = signal(false);

  // Cierra la sesión y vuelve al login.
  cerrarSesion() {
    this.auth.cerrarSesion();
    this.menuAbierto.set(false);
    this.router.navigate(['/login']);
  }
}
