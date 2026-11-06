/** Decorador @UsuarioActual(): devuelve los datos del usuario del token. */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadToken } from '../interfaces/payload.interface';

/**
 * Decorador propio: @UsuarioActual() en un parametro del controller
 * nos da el payload del token que dejo el JwtAuthGuard.
 */
export const UsuarioActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PayloadToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.usuario;
  },
);
