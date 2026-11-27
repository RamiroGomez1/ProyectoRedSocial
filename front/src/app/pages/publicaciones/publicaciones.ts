import {
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../components/avatar/avatar';
import { PostCard } from '../../components/post-card/post-card';
import { ModalService } from '../../services/modal.service';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';

const TAMANIO_MAXIMO = 5 * 1024 * 1024;

@Component({
  selector: 'app-publicaciones',
  imports: [PostCard, Avatar, ReactiveFormsModule, RouterLink],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private publicacionesService = inject(PublicacionesService);
  protected auth = inject(AuthService);

  protected readonly porTanda = 5;
  protected publicaciones = signal<Publicacion[]>([]);
  protected total = signal(0);
  protected orden = signal<OrdenPublicaciones>('fecha');
  protected cargando = signal(true);
  protected cargandoMas = signal(false);
  protected errorCarga = signal<string | null>(null);
  protected errorMas = signal<string | null>(null);
  protected enProceso = signal<Set<string>>(new Set());

  protected quedanPublicaciones = computed(
    () => this.publicaciones().length < this.total(),
  );

  private sentinela = viewChild<ElementRef<HTMLElement>>('sentinela');

  protected publicando = signal(false);
  protected imagen = signal<File | null>(null);
  protected vistaPrevia = signal<string | null>(null);
  protected form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor() {
    effect((onCleanup) => {
      const elemento = this.sentinela()?.nativeElement;
      const cargadas = this.publicaciones().length;
      if (!elemento || cargadas >= this.total()) return;

      const observador = new IntersectionObserver(
        (entradas) => {
          if (entradas[0].isIntersecting) this.cargarMas();
        },
        { rootMargin: '200px' },
      );

      observador.observe(elemento);
      onCleanup(() => observador.disconnect());
    });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.errorMas.set(null);

    this.publicacionesService
      .listar({ orden: this.orden(), offset: 0, limit: this.porTanda })
      .subscribe({
        next: (res) => {
          this.publicaciones.set(res.publicaciones);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          this.errorCarga.set(mensajeDeError(err));
        },
      });
  }

  cargarMas() {
    if (this.cargandoMas() || !this.quedanPublicaciones()) return;

    this.cargandoMas.set(true);
    this.errorMas.set(null);

    this.publicacionesService
      .listar({
        orden: this.orden(),
        offset: this.publicaciones().length,
        limit: this.porTanda,
      })
      .subscribe({
        next: (res) => {
          this.publicaciones.update((lista) => {
            const yaEstan = new Set(lista.map((p) => p._id));
            const nuevas = res.publicaciones.filter((p) => !yaEstan.has(p._id));
            return [...lista, ...nuevas];
          });
          this.total.set(res.total);
          this.cargandoMas.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargandoMas.set(false);
          this.errorMas.set(mensajeDeError(err));
        },
      });
  }

  cambiarOrden(evento: Event) {
    this.orden.set((evento.target as HTMLSelectElement).value as OrdenPublicaciones);
    this.volverAlInicio();
  }

  puedeEliminar(post: Publicacion): boolean {
    return post.autor._id === this.auth.usuario()?._id || this.auth.esAdmin();
  }

  alternarMeGusta(post: Publicacion) {
    if (this.enProceso().has(post._id)) return;
    this.marcarEnProceso(post._id, true);

    const peticion = post.leDiMeGusta
      ? this.publicacionesService.quitarMeGusta(post._id)
      : this.publicacionesService.darMeGusta(post._id);

    peticion.subscribe({
      next: (res) => {
        this.publicaciones.update((lista) =>
          lista.map((p) => (p._id === post._id ? { ...p, ...res } : p)),
        );
        this.marcarEnProceso(post._id, false);
      },
      error: (err: HttpErrorResponse) => {
        this.marcarEnProceso(post._id, false);
        this.modal.error('No se pudo actualizar el me gusta', mensajeDeError(err));
      },
    });
  }

  eliminar(post: Publicacion) {
    this.modal.confirmar(
      '¿Eliminar publicación?',
      `"${post.titulo}" dejará de estar visible para todos.`,
      () => {
        this.publicacionesService.eliminar(post._id).subscribe({
          next: () => {
            this.publicaciones.update((lista) =>
              lista.filter((p) => p._id !== post._id),
            );
            this.total.update((cantidad) => Math.max(0, cantidad - 1));
            this.modal.exito('Listo', 'La publicación fue eliminada.');
          },
          error: (err: HttpErrorResponse) =>
            this.modal.error('No se pudo eliminar', mensajeDeError(err)),
        });
      },
      'Eliminar',
    );
  }

  seleccionarImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.modal.error('Archivo no válido', 'El archivo tiene que ser una imagen.');
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO) {
      this.modal.error('Imagen muy pesada', 'La imagen no puede pesar más de 5 MB.');
      return;
    }
    this.quitarImagen();
    this.imagen.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  quitarImagen() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.imagen.set(null);
    this.vistaPrevia.set(null);
  }

  publicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { titulo, mensaje } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', titulo.trim());
    datos.append('mensaje', mensaje.trim());
    const imagen = this.imagen();
    if (imagen) datos.append('imagen', imagen);

    this.publicando.set(true);
    this.publicacionesService.crear(datos).subscribe({
      next: () => {
        this.publicando.set(false);
        this.form.reset();
        this.quitarImagen();
        this.modal.exito('¡Publicado!', 'Tu publicación ya está visible.');
        this.orden.set('fecha');
        this.volverAlInicio();
      },
      error: (err: HttpErrorResponse) => {
        this.publicando.set(false);
        this.modal.error('No se pudo publicar', mensajeDeError(err));
      },
    });
  }

  invalido(campo: 'titulo' | 'mensaje'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  private volverAlInicio() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cargar();
  }

  private marcarEnProceso(id: string, valor: boolean) {
    this.enProceso.update((actual) => {
      const nuevo = new Set(actual);
      if (valor) nuevo.add(id);
      else nuevo.delete(id);
      return nuevo;
    });
  }
}
