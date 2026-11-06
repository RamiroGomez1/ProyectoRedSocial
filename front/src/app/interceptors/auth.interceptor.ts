/** Interceptor HTTP: agrega el token y maneja la sesión vencida. */
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

/**
 * Interceptor: se ejecuta en TODAS las peticiones HTTP.
 * 1. Agrega el header "Authorization: Bearer <token>" si hay sesion.
 * 2. Si el back responde 401 (token vencido o invalido), cierra la
 *    sesion y manda al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const modal = inject(ModalService);

  const token = auth.token();
  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      // En /auth/login un 401 es "contraseña incorrecta", no sesion vencida
      const esRutaAuth = req.url.includes('/auth/');
      if (err.status === 401 && !esRutaAuth) {
        auth.cerrarSesion();
        modal.info('Tu sesión expiró', 'Volvé a iniciar sesión para continuar.');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
