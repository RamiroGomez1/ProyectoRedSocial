import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PayloadToken } from '../interfaces/payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }

    try {
      const payload = await this.jwtService.verifyAsync<PayloadToken>(token);
      request['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('La sesión no es válida o expiró');
    }
    return true;
  }

  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
