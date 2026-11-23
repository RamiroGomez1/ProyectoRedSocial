import { IsEnum } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto';
import { Perfil } from '../schemas/usuario.schema';

export class CrearUsuarioDto extends RegistroDto {
  @IsEnum(Perfil, {
    message: 'El perfil debe ser "usuario" o "administrador"',
  })
  perfil: Perfil = Perfil.USUARIO;
}
