/** Página principal: crear y listar publicaciones. */
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PostCard } from '../../components/post-card/post-card';
import { ModalService } from '../../services/modal.service';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';

const TAMANIO_MAXIMO = 5 * 1024 * 1024; // 5 MB

@Component({
  selector: 'app-publicaciones',
  imports: [PostCard, ReactiveFormsModule, RouterLink],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private publicacionesService = inject(PublicacionesService);
  protected auth = inject(AuthService);

  // ----- Listado -----
  protected readonly porPagina = 5;
  protected publicaciones = signal<Publicacion[]>([]);
  protected total = signal(0);
  protected orden = signal<OrdenPublicaciones>('fecha');
  protected pagina = signal(1);
  protected cargando = signal(true);
  protected errorCarga = signal<string | null>(null);
  // Ids de publicaciones con un "me gusta" en curso (evita doble click)
  protected enProceso = signal<Set<string>>(new Set());

  protected totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.porPagina)),
  );

  // ----- Nueva publicacion -----
  protected publicando = signal(false);
  protected imagen = signal<File | null>(null);
  protected vistaPrevia = signal<string | null>(null);
  protected form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  // Al entrar a la página, carga las publicaciones.
  ngOnInit() {
    this.cargar();
  }

  // Pide al back la página actual con el orden elegido.
  cargar() {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.publicacionesService
      .listar({
        orden: this.orden(),
        offset: (this.pagina() - 1) * this.porPagina,
        limit: this.porPagina,
      })
      .subscribe({
        next: (res) => {
          this.publicaciones.set(res.publicaciones);
          this.total.set(res.total);
          this.cargando.set(false);
          // Si borramos la ultima de una pagina, volvemos a la anterior
          if (!res.publicaciones.length && this.pagina() > 1) {
            this.irAPagina(this.pagina() - 1);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          this.errorCarga.set(mensajeDeError(err));
        },
      });
  }

  // Cambia el orden y vuelve a la primera página.
  cambiarOrden(evento: Event) {
    this.orden.set((evento.target as HTMLSelectElement).value as OrdenPublicaciones);
    this.irAPagina(1);
  }

  // Va a la página indicada y recarga.
  irAPagina(numero: number) {
    this.pagina.set(numero);
    this.cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // True si la publicación es mía o si soy admin.
  puedeEliminar(post: Publicacion): boolean {
    return post.autor._id === this.auth.usuario()?._id || this.auth.esAdmin();
  }

  // Da o saca el me gusta de una publicación.
  alternarMeGusta(post: Publicacion) {
    if (this.enProceso().has(post._id)) return;
    this.marcarEnProceso(post._id, true);

    // Si ya le di me gusta -> DELETE, si no -> POST
    const peticion = post.leDiMeGusta
      ? this.publicacionesService.quitarMeGusta(post._id)
      : this.publicacionesService.darMeGusta(post._id);

    peticion.subscribe({
      next: (res) => {
        // Actualizamos solo esa publicacion con lo que devolvio el back
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

  // Pide confirmación y elimina la publicación.
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

  // ----- Crear publicacion -----
  seleccionarImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
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

  // Saca la imagen elegida para la nueva publicación.
  quitarImagen() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.imagen.set(null);
    this.vistaPrevia.set(null);
  }

  // Valida el formulario y crea la publicación.
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
        // Mostramos las mas recientes para que se vea la nueva arriba
        this.orden.set('fecha');
        this.irAPagina(1);
      },
      error: (err: HttpErrorResponse) => {
        this.publicando.set(false);
        this.modal.error('No se pudo publicar', mensajeDeError(err));
      },
    });
  }

  // True si el campo tiene error y ya fue tocado.
  invalido(campo: 'titulo' | 'mensaje'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  // Marca o desmarca una publicación con un me gusta en curso.
  private marcarEnProceso(id: string, valor: boolean) {
    this.enProceso.update((actual) => {
      const nuevo = new Set(actual);
      if (valor) nuevo.add(id);
      else nuevo.delete(id);
      return nuevo;
    });
  }
}
