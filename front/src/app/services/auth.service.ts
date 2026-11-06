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

  // Usuario logueado. Por ahora se guarda en localStorage
  // (en el Sprint 3 se reemplaza por el token JWT).
  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  // Se manda como FormData porque incluye la imagen de perfil
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

/**
 * Convierte el error que devuelve el back de Nest en un texto para mostrar.
 * Nest responde: { statusCode, message, error } donde message puede ser un array.
 */
export function mensajeDeError(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Revisá que el back esté corriendo.';
  }
  const mensaje = err.error?.message;
  // Set: saca los mensajes repetidos
  if (Array.isArray(mensaje)) return [...new Set(mensaje)].join('. ');
  if (typeof mensaje === 'string') return mensaje;
  if (err.status === 413) return 'La imagen es demasiado pesada (máximo 2 MB).';
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
