import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';

// Sprint 1: navegacion libre, sin guards (se agregan en el Sprint 3)
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, title: 'Iniciar sesión · Red Social' },
  { path: 'registro', component: Registro, title: 'Crear cuenta · Red Social' },
  { path: 'publicaciones', component: Publicaciones, title: 'Publicaciones · Red Social' },
  { path: 'mi-perfil', component: MiPerfil, title: 'Mi perfil · Red Social' },
  { path: '**', redirectTo: 'login' },
];
