import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { DetallePublicacion } from './pages/detalle-publicacion/detalle-publicacion';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { EditarPerfil } from './pages/editar-perfil/editar-perfil';
import { authGuard, invitadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
  {
    path: 'login',
    component: Login,
    canActivate: [invitadoGuard],
    title: 'Iniciar sesión · Red Social',
  },
  {
    path: 'registro',
    component: Registro,
    canActivate: [invitadoGuard],
    title: 'Crear cuenta · Red Social',
  },
  {
    path: 'publicaciones',
    component: Publicaciones,
    canActivate: [authGuard],
    title: 'Publicaciones · Red Social',
  },
  {
    path: 'publicaciones/:id',
    component: DetallePublicacion,
    canActivate: [authGuard],
    title: 'Publicación · Red Social',
  },
  {
    path: 'mi-perfil',
    component: MiPerfil,
    canActivate: [authGuard],
    title: 'Mi perfil · Red Social',
  },
  {
    path: 'editar-perfil',
    component: EditarPerfil,
    canActivate: [authGuard],
    title: 'Editar perfil · Red Social',
  },
  { path: '**', redirectTo: 'publicaciones' },
];
