import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PayloadToken } from '../interfaces/payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const esPublica = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (esPublica) return true;

    return super.canActivate(context);
  }

  handleRequest<TUser = PayloadToken>(
    error: unknown,
    usuario: TUser | false,
    info: unknown,
  ): TUser {
    if (error || !usuario) {
      const nombre = (info as Error | undefined)?.name;
      const tokenRoto =
        nombre === 'TokenExpiredError' || nombre === 'JsonWebTokenError';

      throw new UnauthorizedException(
        tokenRoto ? 'La sesión no es válida o expiró' : 'Tenés que iniciar sesión',
      );
    }
    return usuario;
  }
}
