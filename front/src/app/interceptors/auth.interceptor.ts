import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

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
