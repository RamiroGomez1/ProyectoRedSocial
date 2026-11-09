import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PostCard } from '../../components/post-card/post-card';
import { AuthService } from '../../services/auth.service';
import { PUBLICACIONES_MOCK } from '../../models/datos-mock';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, PostCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  private auth = inject(AuthService);

  protected usuario = computed(
    () =>
      this.auth.usuario() ?? {
        nombre: 'Lucía',
        apellido: 'Fernández',
        nombreUsuario: 'lucia.fer',
        correo: 'lucia@mail.com',
        fechaNacimiento: '2002-05-14',
        descripcion: 'Estudiante de la Tecnicatura en Programación. Fan del café y de los atardeceres.',
        imagenPerfil: '',
        perfil: 'usuario',
        createdAt: '2026-10-01',
      },
  );

  protected esMock = computed(() => !this.auth.usuario());

  protected ultimasPublicaciones = PUBLICACIONES_MOCK.slice(0, 3);
}
