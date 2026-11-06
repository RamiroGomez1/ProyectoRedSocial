/** DTO para crear un comentario. */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(500, { message: 'El comentario puede tener hasta 500 caracteres' })
  mensaje: string;
}
