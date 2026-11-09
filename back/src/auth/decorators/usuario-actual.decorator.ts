import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadToken } from '../interfaces/payload.interface';

export const UsuarioActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PayloadToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.usuario;
  },
);
