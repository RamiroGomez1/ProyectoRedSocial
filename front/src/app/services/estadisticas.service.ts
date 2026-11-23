import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
  RangoFechas,
  RespuestaEstadistica,
} from '../models/estadisticas';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(
    rango: RangoFechas,
  ): Observable<RespuestaEstadistica<PublicacionesPorUsuario>> {
    return this.http.get<RespuestaEstadistica<PublicacionesPorUsuario>>(
      `${this.url}/publicaciones-por-usuario`,
      { params: this.parametros(rango) },
    );
  }

  comentariosPorDia(
    rango: RangoFechas,
  ): Observable<RespuestaEstadistica<ComentariosPorDia>> {
    return this.http.get<RespuestaEstadistica<ComentariosPorDia>>(
      `${this.url}/comentarios-por-dia`,
      { params: this.parametros(rango) },
    );
  }

  comentariosPorPublicacion(
    rango: RangoFechas,
  ): Observable<RespuestaEstadistica<ComentariosPorPublicacion>> {
    return this.http.get<RespuestaEstadistica<ComentariosPorPublicacion>>(
      `${this.url}/comentarios-por-publicacion`,
      { params: this.parametros(rango) },
    );
  }

  private parametros(rango: RangoFechas): HttpParams {
    let params = new HttpParams();
    if (rango.desde) params = params.set('desde', rango.desde);
    if (rango.hasta) params = params.set('hasta', rango.hasta);
    return params;
  }
}
