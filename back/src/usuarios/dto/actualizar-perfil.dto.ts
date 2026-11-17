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

export class ActualizarPerfilDto {
  @IsOptional()
  @MaxLength(50, { message: 'El nombre puede tener hasta 50 caracteres' })
  @IsNotEmpty({ message: 'El nombre no puede quedar vacio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @MaxLength(50, { message: 'El apellido puede tener hasta 50 caracteres' })
  @IsNotEmpty({ message: 'El apellido no puede quedar vacio' })
  @IsString({ message: 'El apellido debe ser un texto' })
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no es valido' })
  correo?: string;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message:
      'El nombre de usuario solo puede tener letras, numeros, punto y guion bajo',
  })
  @MaxLength(20, {
    message: 'El nombre de usuario puede tener hasta 20 caracteres',
  })
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  nombreUsuario?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento no es valida' })
  fechaNacimiento?: string;

  @IsOptional()
  @MaxLength(200, { message: 'La descripcion puede tener hasta 200 caracteres' })
  @IsString({ message: 'La descripcion debe ser un texto' })
  descripcion?: string;
}
