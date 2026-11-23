import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Avatar } from '../../components/avatar/avatar';
import { AutofocoDirective } from '../../directives/autofoco.directive';
import { ResaltarDirective } from '../../directives/resaltar.directive';
import { PluralizarPipe } from '../../pipes/pluralizar.pipe';
import { RecortarPipe } from '../../pipes/recortar.pipe';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario';
import { camposIguales, edadMinima, passwordFuerte } from '../../validators/validadores';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

type CampoNuevo =
  | 'nombre'
  | 'apellido'
  | 'correo'
  | 'nombreUsuario'
  | 'password'
  | 'repetirPassword'
  | 'fechaNacimiento'
  | 'descripcion'
  | 'perfil';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Avatar,
    AutofocoDirective,
    ResaltarDirective,
    PluralizarPipe,
    RecortarPipe,
  ],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private modal = inject(ModalService);
  protected auth = inject(AuthService);

  protected usuarios = signal<Usuario[]>([]);
  protected cargando = signal(true);
  protected errorCarga = signal<string | null>(null);
  protected enProceso = signal<Set<string>>(new Set());

  protected busqueda = signal('');
  protected formAbierto = signal(false);
  protected creando = signal(false);
  protected imagen = signal<File | null>(null);
  protected errorImagen = signal<string | null>(null);

  protected form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9._]+$/),
        ],
      ],
      password: ['', [Validators.required, passwordFuerte]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
      descripcion: ['', [Validators.maxLength(200)]],
      perfil: ['usuario' as 'usuario' | 'administrador', [Validators.required]],
    },
    { validators: camposIguales('password', 'repetirPassword') },
  );

  protected filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.usuarios();

    return this.usuarios().filter((u) =>
      `${u.nombre} ${u.apellido} ${u.nombreUsuario} ${u.correo}`
        .toLowerCase()
        .includes(texto),
    );
  });

  protected activos = computed(
    () => this.usuarios().filter((u) => u.activo).length,
  );

  protected administradores = computed(
    () => this.usuarios().filter((u) => u.perfil === 'administrador').length,
  );

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.usuariosService.listar().subscribe({
      next: (res) => {
        this.usuarios.set(res.usuarios);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeDeError(err));
      },
    });
  }

  filtrar(evento: Event) {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  esYo(usuario: Usuario): boolean {
    return usuario._id === this.auth.usuario()?._id;
  }

  cambiarEstado(usuario: Usuario) {
    if (this.enProceso().has(usuario._id)) return;

    const deshabilitar = usuario.activo;
    const accion = deshabilitar ? 'Deshabilitar' : 'Habilitar';

    this.modal.confirmar(
      `¿${accion} a ${usuario.nombre} ${usuario.apellido}?`,
      deshabilitar
        ? 'No va a poder iniciar sesión hasta que lo habilites de nuevo.'
        : 'Va a poder volver a usar la aplicación.',
      () => this.ejecutarCambio(usuario, !deshabilitar),
      accion,
      deshabilitar,
    );
  }

  private ejecutarCambio(usuario: Usuario, activo: boolean) {
    this.marcarEnProceso(usuario._id, true);

    const peticion = activo
      ? this.usuariosService.habilitar(usuario._id)
      : this.usuariosService.deshabilitar(usuario._id);

    peticion.subscribe({
      next: (res) => {
        this.usuarios.update((lista) =>
          lista.map((u) => (u._id === usuario._id ? res.usuario : u)),
        );
        this.marcarEnProceso(usuario._id, false);
      },
      error: (err: HttpErrorResponse) => {
        this.marcarEnProceso(usuario._id, false);
        this.modal.error('No se pudo cambiar el estado', mensajeDeError(err));
      },
    });
  }

  seleccionarImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    this.errorImagen.set(null);
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO) {
      this.errorImagen.set('La imagen no puede pesar más de 2 MB.');
      return;
    }
    this.imagen.set(archivo);
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', valores.nombre.trim());
    datos.append('apellido', valores.apellido.trim());
    datos.append('correo', valores.correo.trim());
    datos.append('nombreUsuario', valores.nombreUsuario.trim());
    datos.append('password', valores.password);
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('perfil', valores.perfil);
    if (valores.descripcion.trim()) {
      datos.append('descripcion', valores.descripcion.trim());
    }
    const imagen = this.imagen();
    if (imagen) datos.append('imagenPerfil', imagen);

    this.creando.set(true);
    this.usuariosService.crear(datos).subscribe({
      next: (res) => {
        this.creando.set(false);
        this.usuarios.update((lista) => [res.usuario, ...lista]);
        this.cerrarFormulario();
        this.modal.exito(
          'Usuario creado',
          `${res.usuario.nombre} ya puede iniciar sesión como ${res.usuario.perfil}.`,
        );
      },
      error: (err: HttpErrorResponse) => {
        this.creando.set(false);
        this.modal.error('No se pudo crear el usuario', mensajeDeError(err));
      },
    });
  }

  abrirFormulario() {
    this.formAbierto.set(true);
  }

  cerrarFormulario() {
    this.formAbierto.set(false);
    this.form.reset({ perfil: 'usuario' });
    this.imagen.set(null);
    this.errorImagen.set(null);
  }

  invalido(campo: CampoNuevo): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  tieneError(campo: CampoNuevo, error: string): boolean {
    return this.form.controls[campo].hasError(error);
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
