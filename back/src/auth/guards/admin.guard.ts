import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Perfil } from '../../usuarios/schemas/usuario.schema';
import { PayloadToken } from '../interfaces/payload.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: PayloadToken }>();

    const usuario = request.user;

    if (!usuario || usuario.perfil !== Perfil.ADMINISTRADOR) {
      throw new ForbiddenException(
        'Esta sección es solo para administradores',
      );
    }

    return true;
  }
}
