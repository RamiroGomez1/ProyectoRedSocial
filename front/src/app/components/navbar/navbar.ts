import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Avatar } from '../avatar/avatar';
import { ClickAfueraDirective } from '../../directives/click-afuera.directive';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Avatar, ClickAfueraDirective],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected menuAbierto = signal(false);

  cerrarSesion() {
    this.auth.cerrarSesion();
    this.menuAbierto.set(false);
    this.router.navigate(['/login']);
  }
}
