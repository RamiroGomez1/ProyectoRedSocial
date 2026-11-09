import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario';

const CLAVE_USUARIO = 'usuario';
const CLAVE_TOKEN = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());
  readonly token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  readonly logueado = computed(() => !!this.token() && !!this.usuario());
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  registro(datos: FormData): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.url}/registro`, datos);
  }

  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/login`, { identificador, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuario.set(null);
    this.token.set(null);
  }

  private guardarSesion(res: RespuestaAuth) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(res.usuario));
    localStorage.setItem(CLAVE_TOKEN, res.token);
    this.usuario.set(res.usuario);
    this.token.set(res.token);
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
