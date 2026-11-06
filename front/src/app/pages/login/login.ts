import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService, mensajeDeError } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { passwordFuerte } from '../../validators/validadores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private modal = inject(ModalService);
  private router = inject(Router);

  protected cargando = signal(false);
  protected verPassword = signal(false);

  protected form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, passwordFuerte]],
  });

  // true si el campo tiene error y el usuario ya lo toco
  invalido(campo: 'identificador' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  enviar() {
    if (this.form.invalid) {
      // Marca todo como tocado para que se vean los mensajes de error
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { identificador, password } = this.form.getRawValue();

    this.auth.login(identificador.trim(), password).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.modal.exito(
          `¡Hola, ${res.usuario.nombre}!`,
          'Iniciaste sesión correctamente.',
          () => this.router.navigate(['/publicaciones']),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modal.error('No pudimos iniciar sesión', mensajeDeError(err));
      },
    });
  }
}
