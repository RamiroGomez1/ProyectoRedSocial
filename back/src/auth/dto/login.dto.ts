/** DTO de login: valida el usuario/correo y la contraseña recibidos. */
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Puede ser el correo o el nombre de usuario
  @IsString({ message: 'Ingresa tu correo o nombre de usuario' })
  @IsNotEmpty({ message: 'Ingresa tu correo o nombre de usuario' })
  identificador: string;

  @IsString({ message: 'Ingresa tu contraseña' })
  @IsNotEmpty({ message: 'Ingresa tu contraseña' })
  password: string;
}
