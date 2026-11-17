import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RespuestaAuth,
  RespuestaPerfil,
  RespuestaToken,
  Usuario,
} from '../models/usuario';

const CLAVE_USUARIO = 'usuario';
const CLAVE_TOKEN = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;
  private urlUsuarios = `${environment.apiUrl}/usuarios`;

  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());
  readonly token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  readonly verificando = signal(true);

  readonly logueado = computed(() => !!this.token() && !!this.usuario());
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  registro(datos: FormData): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/registro`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/login`, { identificador, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  verificarSesion(): Observable<Usuario | null> {
    if (!this.token()) {
      this.verificando.set(false);
      return of(null);
    }

    return this.http.post<RespuestaPerfil>(`${this.url}/autorizar`, {}).pipe(
      map((res) => res.usuario),
      tap((usuario) => this.guardarUsuario(usuario)),
      catchError(() => {
        this.cerrarSesion();
        return of(null);
      }),
      finalize(() => this.verificando.set(false)),
    );
  }

  refrescarToken(): Observable<string> {
    return this.http.post<RespuestaToken>(`${this.url}/refrescar`, {}).pipe(
      map((res) => res.token),
      tap((token) => {
        localStorage.setItem(CLAVE_TOKEN, token);
        this.token.set(token);
      }),
    );
  }

  refrescarPerfil(): Observable<Usuario> {
    return this.http.get<RespuestaPerfil>(`${this.urlUsuarios}/mi-perfil`).pipe(
      map((res) => res.usuario),
      tap((usuario) => this.guardarUsuario(usuario)),
    );
  }

  actualizarPerfil(datos: FormData): Observable<Usuario> {
    return this.http
      .patch<RespuestaPerfil>(`${this.urlUsuarios}/mi-perfil`, datos)
      .pipe(
        map((res) => res.usuario),
        tap((usuario) => this.guardarUsuario(usuario)),
      );
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuario.set(null);
    this.token.set(null);
  }

  private guardarSesion(res: RespuestaAuth) {
    localStorage.setItem(CLAVE_TOKEN, res.token);
    this.token.set(res.token);
    this.guardarUsuario(res.usuario);
  }

  private guardarUsuario(usuario: Usuario) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  }
}

export function mensajeDeError(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Revisá que el back esté corriendo.';
  }
  const mensaje = err.error?.message;
  if (Array.isArray(mensaje)) return [...new Set(mensaje)].join('. ');
  if (typeof mensaje === 'string') return mensaje;
  if (err.status === 413) return 'La imagen es demasiado pesada.';
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
