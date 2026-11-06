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

// Regla de la consigna: minimo 8 caracteres, una mayuscula y un numero
export const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// Los datos llegan como multipart/form-data (por la imagen),
// asi que todos vienen como texto.
export class RegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(50)
  apellido: string;

  @IsEmail({}, { message: 'El correo no es valido' })
  correo: string;

  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'El nombre de usuario solo puede tener letras, numeros, punto y guion bajo',
  })
  nombreUsuario: string;

  @Matches(REGEX_PASSWORD, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayuscula y un numero',
  })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es valida' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La descripcion puede tener hasta 200 caracteres' })
  descripcion?: string;
}
