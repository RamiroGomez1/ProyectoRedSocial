/** Servicio que hace las peticiones de publicaciones y comentarios al back. */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Comentario,
  OrdenPublicaciones,
  Publicacion,
  RespuestaComentarios,
  RespuestaMeGusta,
  RespuestaPublicaciones,
} from '../models/publicacion';

export interface FiltrosPublicaciones {
  orden?: OrdenPublicaciones;
  usuario?: string;
  offset?: number;
  limit?: number;
}

// Todas las llamadas al back relacionadas a publicaciones.
// El token lo agrega solo el interceptor (auth.interceptor.ts).
@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  // GET del listado con filtros y paginación.
  listar(filtros: FiltrosPublicaciones): Observable<RespuestaPublicaciones> {
    // HttpParams arma el ?orden=...&offset=... (solo con los que vienen)
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null) params = params.set(clave, valor);
    });
    return this.http.get<RespuestaPublicaciones>(this.url, { params });
  }

  // FormData porque puede llevar imagen
  crear(datos: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.url, datos);
  }

  // DELETE: baja lógica de una publicación.
  eliminar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`);
  }

  // POST: da me gusta.
  darMeGusta(id: string): Observable<RespuestaMeGusta> {
    return this.http.post<RespuestaMeGusta>(`${this.url}/${id}/me-gusta`, {});
  }

  // DELETE: saca el me gusta.
  quitarMeGusta(id: string): Observable<RespuestaMeGusta> {
    return this.http.delete<RespuestaMeGusta>(`${this.url}/${id}/me-gusta`);
  }

  // GET de los comentarios de una publicación.
  listarComentarios(id: string, offset = 0, limit = 5): Observable<RespuestaComentarios> {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<RespuestaComentarios>(`${this.url}/${id}/comentarios`, { params });
  }

  // POST: agrega un comentario.
  comentar(id: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.url}/${id}/comentarios`, { mensaje });
  }
}
