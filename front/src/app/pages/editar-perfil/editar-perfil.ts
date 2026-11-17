import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Avatar } from '../../components/avatar/avatar';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { edadMinima } from '../../validators/validadores';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

type CampoPerfil =
  | 'nombre'
  | 'apellido'
  | 'correo'
  | 'nombreUsuario'
  | 'fechaNacimiento'
  | 'descripcion';

@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule, RouterLink, Avatar],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfil {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private router = inject(Router);
  protected auth = inject(AuthService);

  protected guardando = signal(false);
  protected imagen = signal<File | null>(null);
  protected vistaPrevia = signal<string | null>(null);
  protected errorImagen = signal<string | null>(null);

  protected form = this.fb.nonNullable.group({
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
    fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  constructor() {
    const usuario = this.auth.usuario();
    if (usuario) {
      this.form.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        nombreUsuario: usuario.nombreUsuario,
        fechaNacimiento: usuario.fechaNacimiento?.slice(0, 10) ?? '',
        descripcion: usuario.descripcion ?? '',
      });
    }
  }

  invalido(campo: CampoPerfil): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  tieneError(campo: CampoPerfil, error: string): boolean {
    return this.form.controls[campo].hasError(error);
  }

  seleccionarImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    input.value = '';
    this.errorImagen.set(null);

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (jpg, png, webp...).');
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO) {
      this.errorImagen.set('La imagen no puede pesar más de 2 MB.');
      return;
    }

    this.quitarImagenNueva();
    this.imagen.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  quitarImagenNueva() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.imagen.set(null);
    this.vistaPrevia.set(null);
  }

  guardar() {
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
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('descripcion', valores.descripcion.trim());

    const imagen = this.imagen();
    if (imagen) datos.append('imagenPerfil', imagen);

    this.guardando.set(true);
    this.auth.actualizarPerfil(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.quitarImagenNueva();
        this.modal.exito('Perfil actualizado', 'Tus datos se guardaron correctamente.', () =>
          this.router.navigate(['/mi-perfil']),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.modal.error('No pudimos guardar los cambios', mensajeDeError(err));
      },
    });
  }
}
