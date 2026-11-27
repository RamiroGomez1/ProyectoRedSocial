import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { Avatar } from '../../components/avatar/avatar';
import { PostCard } from '../../components/post-card/post-card';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { UsuariosService } from '../../services/usuarios.service';
import { PerfilPublico } from '../../models/usuario';
import { Publicacion, RespuestaPublicaciones } from '../../models/publicacion';

const ULTIMAS = 3;

@Component({
  selector: 'app-perfil',
  imports: [DatePipe, RouterLink, Avatar, PostCard],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private modal = inject(ModalService);
  private usuariosService = inject(UsuariosService);
  private publicacionesService = inject(PublicacionesService);
  protected auth = inject(AuthService);

  protected usuario = signal<PerfilPublico | null>(null);
  protected ultimas = signal<Publicacion[]>([]);
  protected cargando = signal(true);
  protected errorCarga = signal<string | null>(null);

  private id = '';

  ngOnInit() {
    this.id = this.ruta.snapshot.paramMap.get('id') ?? '';

    if (this.id === this.auth.usuario()?._id) {
      this.router.navigate(['/mi-perfil'], { replaceUrl: true });
      return;
    }

    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set(null);

    forkJoin({
      perfil: this.usuariosService.perfil(this.id),
      publicaciones: this.listarUltimas(),
    }).subscribe({
      next: ({ perfil, publicaciones }) => {
        this.usuario.set(perfil.usuario);
        this.ultimas.set(publicaciones.publicaciones);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeDeError(err));
      },
    });
  }

  puedeEliminar(post: Publicacion): boolean {
    return post.autor._id === this.auth.usuario()?._id || this.auth.esAdmin();
  }

  alternarMeGusta(post: Publicacion) {
    const peticion = post.leDiMeGusta
      ? this.publicacionesService.quitarMeGusta(post._id)
      : this.publicacionesService.darMeGusta(post._id);

    peticion.subscribe({
      next: (res) =>
        this.ultimas.update((lista) =>
          lista.map((p) => (p._id === post._id ? { ...p, ...res } : p)),
        ),
      error: (err: HttpErrorResponse) =>
        this.modal.error('No se pudo actualizar el me gusta', mensajeDeError(err)),
    });
  }

  eliminar(post: Publicacion) {
    this.modal.confirmar(
      '¿Eliminar publicación?',
      `"${post.titulo}" dejará de estar visible para todos.`,
      () => {
        this.publicacionesService.eliminar(post._id).subscribe({
          next: () => {
            this.modal.exito('Listo', 'La publicación fue eliminada.');
            this.recargarPublicaciones();
          },
          error: (err: HttpErrorResponse) =>
            this.modal.error('No se pudo eliminar', mensajeDeError(err)),
        });
      },
      'Eliminar',
    );
  }

  private listarUltimas(): Observable<RespuestaPublicaciones> {
    return this.publicacionesService.listar({
      usuario: this.id,
      orden: 'fecha',
      limit: ULTIMAS,
    });
  }

  private recargarPublicaciones() {
    this.listarUltimas().subscribe({
      next: (res) => this.ultimas.set(res.publicaciones),
      error: (err: HttpErrorResponse) =>
        this.modal.error('No pudimos actualizar las publicaciones', mensajeDeError(err)),
    });
  }
}
