import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const inicio = Date.now();
    const ruta = request.originalUrl.split('?')[0];

    response.once('finish', () => {
      const duracion = Date.now() - inicio;
      this.logger.log(
        `${request.method} ${ruta} → ${response.statusCode} (${duracion} ms)`,
      );
    });

    next();
  }
}
