import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(valor: string, metadata: ArgumentMetadata): string {
    if (!isObjectIdOrHexString(valor)) {
      throw new BadRequestException(
        `El parámetro "${metadata.data ?? 'id'}" no es un ID válido`,
      );
    }
    return valor;
  }
}
