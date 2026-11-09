import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @MaxLength(100, { message: 'El título puede tener hasta 100 caracteres' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título es obligatorio' })
  titulo: string;

  @MaxLength(1000, { message: 'El mensaje puede tener hasta 1000 caracteres' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString({ message: 'El mensaje es obligatorio' })
  mensaje: string;
}
