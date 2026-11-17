import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadToken } from '../interfaces/payload.interface';

export const UsuarioActual = createParamDecorator(
  (campo: keyof PayloadToken | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: PayloadToken }>();
    return campo ? request.user[campo] : request.user;
  },
);
