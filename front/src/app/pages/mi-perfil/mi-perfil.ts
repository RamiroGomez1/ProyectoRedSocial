import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { PostCard } from '../../components/post-card/post-card';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Comentario, Publicacion } from '../../models/publicacion';

interface PublicacionConComentarios {
  publicacion: Publicacion;
  comentarios: Comentario[];
}

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, PostCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  protected auth = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private modal = inject(ModalService);

  protected ultimas = signal<PublicacionConComentarios[]>([]);
  protected cargando = signal(true);
  protected errorCarga = signal<string | null>(null);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.publicacionesService
      .listar({ usuario: usuario._id, orden: 'fecha', limit: 3 })
      .pipe(
        switchMap((res) => {
          if (!res.publicaciones.length) return of([]);
          return forkJoin(
            res.publicaciones.map((publicacion) =>
              this.publicacionesService
                .listarComentarios(publicacion._id, 0, 50)
                .pipe(map((c) => ({ publicacion, comentarios: c.comentarios }))),
            ),
          );
        }),
      )
      .subscribe({
        next: (lista) => {
          this.ultimas.set(lista);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          this.errorCarga.set(mensajeDeError(err));
        },
      });
  }

  alternarMeGusta(post: Publicacion) {
    const peticion = post.leDiMeGusta
      ? this.publicacionesService.quitarMeGusta(post._id)
      : this.publicacionesService.darMeGusta(post._id);

    peticion.subscribe({
      next: (res) =>
        this.ultimas.update((lista) =>
          lista.map((item) =>
            item.publicacion._id === post._id
              ? { ...item, publicacion: { ...item.publicacion, ...res } }
              : item,
          ),
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
            this.cargar();
          },
          error: (err: HttpErrorResponse) =>
            this.modal.error('No se pudo eliminar', mensajeDeError(err)),
        });
      },
      'Eliminar',
    );
  }
}
