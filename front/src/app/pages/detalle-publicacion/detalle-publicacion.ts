import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Avatar } from '../../components/avatar/avatar';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Comentario, Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-detalle-publicacion',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Avatar],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css',
})
export class DetallePublicacion implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private publicacionesService = inject(PublicacionesService);
  protected auth = inject(AuthService);

  protected readonly porPagina = 5;

  protected publicacion = signal<Publicacion | null>(null);
  protected comentarios = signal<Comentario[]>([]);
  protected totalComentarios = signal(0);

  protected cargando = signal(true);
  protected cargandoMas = signal(false);
  protected errorCarga = signal<string | null>(null);
  protected comentando = signal(false);
  protected guardandoEdicion = signal(false);
  protected meGustaEnProceso = signal(false);
  protected editandoId = signal<string | null>(null);

  protected quedanComentarios = computed(
    () => this.comentarios().length < this.totalComentarios(),
  );

  protected form = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.maxLength(500)]],
  });

  protected formEdicion = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.maxLength(500)]],
  });

  private id = '';

  ngOnInit() {
    this.id = this.ruta.snapshot.paramMap.get('id') ?? '';
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set(null);

    forkJoin({
      publicacion: this.publicacionesService.obtener(this.id),
      comentarios: this.publicacionesService.listarComentarios(
        this.id,
        0,
        this.porPagina,
      ),
    }).subscribe({
      next: ({ publicacion, comentarios }) => {
        this.publicacion.set(publicacion);
        this.comentarios.set(comentarios.comentarios);
        this.totalComentarios.set(comentarios.total);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeDeError(err));
      },
    });
  }

  cargarMas() {
    this.cargandoMas.set(true);

    this.publicacionesService
      .listarComentarios(this.id, this.comentarios().length, this.porPagina)
      .subscribe({
        next: (res) => {
          this.comentarios.update((lista) => [...lista, ...res.comentarios]);
          this.totalComentarios.set(res.total);
          this.cargandoMas.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargandoMas.set(false);
          this.modal.error('No pudimos traer más comentarios', mensajeDeError(err));
        },
      });
  }

  comentar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.comentando.set(true);
    const mensaje = this.form.getRawValue().mensaje.trim();

    this.publicacionesService.comentar(this.id, mensaje).subscribe({
      next: (comentario) => {
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.totalComentarios.update((total) => total + 1);
        this.publicacion.update((p) =>
          p ? { ...p, cantidadComentarios: p.cantidadComentarios + 1 } : p,
        );
        this.form.reset();
        this.comentando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.comentando.set(false);
        this.modal.error('No pudimos publicar tu comentario', mensajeDeError(err));
      },
    });
  }

  empezarEdicion(comentario: Comentario) {
    this.editandoId.set(comentario._id);
    this.formEdicion.setValue({ mensaje: comentario.mensaje });
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  guardarEdicion(comentario: Comentario) {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    this.guardandoEdicion.set(true);
    const mensaje = this.formEdicion.getRawValue().mensaje.trim();

    this.publicacionesService
      .editarComentario(this.id, comentario._id, mensaje)
      .subscribe({
        next: (editado) => {
          this.comentarios.update((lista) =>
            lista.map((c) => (c._id === editado._id ? editado : c)),
          );
          this.editandoId.set(null);
          this.guardandoEdicion.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.guardandoEdicion.set(false);
          this.modal.error('No pudimos editar el comentario', mensajeDeError(err));
        },
      });
  }

  alternarMeGusta() {
    const post = this.publicacion();
    if (!post || this.meGustaEnProceso()) return;

    this.meGustaEnProceso.set(true);
    const peticion = post.leDiMeGusta
      ? this.publicacionesService.quitarMeGusta(post._id)
      : this.publicacionesService.darMeGusta(post._id);

    peticion.subscribe({
      next: (res) => {
        this.publicacion.update((p) => (p ? { ...p, ...res } : p));
        this.meGustaEnProceso.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.meGustaEnProceso.set(false);
        this.modal.error('No se pudo actualizar el me gusta', mensajeDeError(err));
      },
    });
  }

  eliminar() {
    const post = this.publicacion();
    if (!post) return;

    this.modal.confirmar(
      '¿Eliminar publicación?',
      `"${post.titulo}" dejará de estar visible para todos.`,
      () => {
        this.publicacionesService.eliminar(post._id).subscribe({
          next: () => {
            this.modal.exito('Listo', 'La publicación fue eliminada.', () =>
              this.router.navigate(['/publicaciones']),
            );
          },
          error: (err: HttpErrorResponse) =>
            this.modal.error('No se pudo eliminar', mensajeDeError(err)),
        });
      },
      'Eliminar',
    );
  }

  puedeEditar(comentario: Comentario): boolean {
    return comentario.autor._id === this.auth.usuario()?._id;
  }

  puedeEliminar(): boolean {
    const post = this.publicacion();
    if (!post) return false;
    return post.autor._id === this.auth.usuario()?._id || this.auth.esAdmin();
  }
}
