import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Ingresa tu correo o nombre de usuario' })
  @IsNotEmpty({ message: 'Ingresa tu correo o nombre de usuario' })
  identificador: string;

  @IsString({ message: 'Ingresa tu contraseña' })
  @IsNotEmpty({ message: 'Ingresa tu contraseña' })
  password: string;
}
