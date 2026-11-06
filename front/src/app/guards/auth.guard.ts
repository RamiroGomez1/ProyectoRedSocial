/** Guard de rutas: si no hay sesión, redirige al login. */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Solo deja entrar a la ruta si hay sesion; si no, redirige al login.
// (En el Sprint 3 ademas se valida el token contra el back al iniciar)
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado() ? true : router.createUrlTree(['/login']);
};
