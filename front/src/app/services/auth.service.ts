import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario';

const CLAVE_USUARIO = 'usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  registro(datos: FormData): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.url}/registro`, datos);
  }

  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/login`, { identificador, password })
      .pipe(tap((res) => this.guardarUsuario(res.usuario)));
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuario.set(null);
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
  if (err.status === 413) return 'La imagen es demasiado pesada (máximo 2 MB).';
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
