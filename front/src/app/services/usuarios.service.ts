import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

export interface RespuestaUsuarios {
  usuarios: Usuario[];
  total: number;
}

export interface RespuestaUsuario {
  mensaje: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar(): Observable<RespuestaUsuarios> {
    return this.http.get<RespuestaUsuarios>(this.url);
  }

  crear(datos: FormData): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(this.url, datos);
  }

  deshabilitar(id: string): Observable<RespuestaUsuario> {
    return this.http.delete<RespuestaUsuario>(`${this.url}/${id}`);
  }

  habilitar(id: string): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.url}/${id}/alta`, {});
  }
}
