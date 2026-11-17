import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadToken } from './interfaces/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET')!,
      ignoreExpiration: false,
      algorithms: ['HS256'],
    });
  }

  validate(payload: PayloadToken): PayloadToken {
    return {
      sub: payload.sub,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
  }
}
