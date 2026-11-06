/** Rutas de la aplicación y qué página muestra cada una. */
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { authGuard } from './guards/auth.guard';

// Publicaciones y Mi perfil necesitan sesion (authGuard)
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, title: 'Iniciar sesión · Red Social' },
  { path: 'registro', component: Registro, title: 'Crear cuenta · Red Social' },
  { path: 'publicaciones', component: Publicaciones, canActivate: [authGuard], title: 'Publicaciones · Red Social' },
  { path: 'mi-perfil', component: MiPerfil, canActivate: [authGuard], title: 'Mi perfil · Red Social' },
  { path: '**', redirectTo: 'login' },
];
