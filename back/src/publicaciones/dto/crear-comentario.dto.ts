import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearComentarioDto {
  @MaxLength(500, { message: 'El comentario puede tener hasta 500 caracteres' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @IsString({ message: 'El comentario no puede estar vacío' })
  mensaje: string;
}
