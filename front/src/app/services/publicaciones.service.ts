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

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  listar(filtros: FiltrosPublicaciones): Observable<RespuestaPublicaciones> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null) params = params.set(clave, valor);
    });
    return this.http.get<RespuestaPublicaciones>(this.url, { params });
  }

  crear(datos: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`);
  }

  darMeGusta(id: string): Observable<RespuestaMeGusta> {
    return this.http.post<RespuestaMeGusta>(`${this.url}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string): Observable<RespuestaMeGusta> {
    return this.http.delete<RespuestaMeGusta>(`${this.url}/${id}/me-gusta`);
  }

  listarComentarios(id: string, offset = 0, limit = 5): Observable<RespuestaComentarios> {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<RespuestaComentarios>(`${this.url}/${id}/comentarios`, { params });
  }

  comentar(id: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.url}/${id}/comentarios`, { mensaje });
  }
}
