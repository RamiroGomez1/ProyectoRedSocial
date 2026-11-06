/** DTO para crear una publicación. */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Llega como form-data (puede traer imagen)
export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título puede tener hasta 100 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(1000, { message: 'El mensaje puede tener hasta 1000 caracteres' })
  mensaje: string;
}
