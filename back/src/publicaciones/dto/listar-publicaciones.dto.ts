/** DTO de los filtros del listado (orden, usuario, offset, limit). */
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// Query params de GET /publicaciones
// Ej: /publicaciones?orden=meGusta&offset=0&limit=5&usuario=<id>
export class ListarPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'meGusta'], { message: 'El orden debe ser "fecha" o "meGusta"' })
  orden: 'fecha' | 'meGusta' = 'fecha';

  // Filtrar las publicaciones de un usuario en particular
  @IsOptional()
  @IsMongoId({ message: 'El usuario no es un id válido' })
  usuario?: string;

  // Los query params llegan como texto: @Type los convierte a numero
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
