/** Guard que protege rutas: solo deja pasar peticiones con un token JWT válido. */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PayloadToken } from '../interfaces/payload.interface';

/**
 * Guard: se ejecuta ANTES del controller.
 * Si devuelve true, la peticion sigue; si lanza error, se corta con 401.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  // Verifica el token y guarda sus datos en la request.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }

    try {
      // verifyAsync valida la firma y que no este vencido
      const payload = await this.jwtService.verifyAsync<PayloadToken>(token);
      // Lo dejamos en la request para usarlo en el controller
      request['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('La sesión no es válida o expiró');
    }
    return true;
  }

  // El front manda el header:  Authorization: Bearer <token>
  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
