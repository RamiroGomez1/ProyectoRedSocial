import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { camposIguales, edadMinima, passwordFuerte } from '../../validators/validadores';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

type CampoRegistro =
  | 'nombre'
  | 'apellido'
  | 'correo'
  | 'nombreUsuario'
  | 'password'
  | 'repetirPassword'
  | 'fechaNacimiento'
  | 'descripcion';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private modal = inject(ModalService);
  private router = inject(Router);

  protected cargando = signal(false);
  protected enviado = signal(false);

  protected imagen = signal<File | null>(null);
  protected vistaPrevia = signal<string | null>(null);
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
    },
    { validators: camposIguales('password', 'repetirPassword') },
  );

  invalido(campo: CampoRegistro): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  tieneError(campo: CampoRegistro, error: string): boolean {
    return this.form.controls[campo].hasError(error);
  }

  seleccionarImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorImagen.set(null);

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (jpg, png, webp...).');
      input.value = '';
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO) {
      this.errorImagen.set('La imagen no puede pesar más de 2 MB.');
      input.value = '';
      return;
    }

    this.imagen.set(archivo);
    const anterior = this.vistaPrevia();
    if (anterior) URL.revokeObjectURL(anterior);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  enviar() {
    this.enviado.set(true);
    if (!this.imagen()) {
      this.errorImagen.set('Elegí una foto de perfil.');
    }
    if (this.form.invalid || !this.imagen()) {
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
    datos.append('descripcion', valores.descripcion.trim());
    datos.append('imagenPerfil', this.imagen()!);

    this.cargando.set(true);
    this.auth.registro(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.modal.exito(
          '¡Cuenta creada!',
          'Tu usuario se registró correctamente. Ahora podés iniciar sesión.',
          () => this.router.navigate(['/login']),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modal.error('No pudimos crear tu cuenta', mensajeDeError(err));
      },
    });
  }
}
