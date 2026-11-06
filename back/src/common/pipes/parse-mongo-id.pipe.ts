/** Pipe que valida que un id de la URL sea un ObjectId de Mongo. */
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

// Pipe propio: valida que un :id de la URL sea un ObjectId de Mongo.
// Si no lo es, corta con 400 en lugar de que Mongo tire un error 500.
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  // Devuelve el id si es válido; si no, responde 400.
  transform(valor: string): string {
    if (!isValidObjectId(valor)) {
      throw new BadRequestException(`"${valor}" no es un id válido`);
    }
    return valor;
  }
}
