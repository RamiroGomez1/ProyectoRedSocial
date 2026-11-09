import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegistroDto {
  @MaxLength(50, { message: 'El nombre puede tener hasta 50 caracteres' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre es obligatorio' })
  nombre: string;

  @MaxLength(50, { message: 'El apellido puede tener hasta 50 caracteres' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es valido' })
  correo: string;

  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'El nombre de usuario solo puede tener letras, numeros, punto y guion bajo',
  })
  @MaxLength(20, { message: 'El nombre de usuario puede tener hasta 20 caracteres' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre de usuario es obligatorio' })
  nombreUsuario: string;

  @Matches(REGEX_PASSWORD, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayuscula y un numero',
  })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es valida' })
  fechaNacimiento: string;

  @IsOptional()
  @MaxLength(200, { message: 'La descripcion puede tener hasta 200 caracteres' })
  @IsString({ message: 'La descripcion debe ser un texto' })
  descripcion?: string;
}
