import { Controller } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

// Las rutas de administracion de usuarios se agregan en el Sprint 4
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}
}
