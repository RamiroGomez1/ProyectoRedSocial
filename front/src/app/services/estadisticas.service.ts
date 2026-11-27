import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  IngresosPorUsuario,
  MeGustaPorDia,
  PublicacionesPorUsuario,
  RangoFechas,
  RespuestaEstadistica,
  VisitasPorUsuario,
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

  ingresosPorUsuario(
    rango: RangoFechas,
  ): Observable<RespuestaEstadistica<IngresosPorUsuario>> {
    return this.http.get<RespuestaEstadistica<IngresosPorUsuario>>(
      `${this.url}/ingresos-por-usuario`,
      { params: this.parametros(rango) },
    );
  }

  visitasAMiPerfil(
    rango: RangoFechas,
  ): Observable<RespuestaEstadistica<VisitasPorUsuario>> {
    return this.http.get<RespuestaEstadistica<VisitasPorUsuario>>(
      `${this.url}/visitas-a-mi-perfil`,
      { params: this.parametros(rango) },
    );
  }

  meGustaPorDia(
    rango: RangoFechas,
  ): Observable<RespuestaEstadistica<MeGustaPorDia>> {
    return this.http.get<RespuestaEstadistica<MeGustaPorDia>>(
      `${this.url}/me-gusta-por-dia`,
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
