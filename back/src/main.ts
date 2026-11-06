/** Punto de entrada del back: crea la app Nest, configura CORS, el prefijo /api y la validación global. */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Si Node solo tiene un DNS local (127.0.0.1), a veces no puede resolver
// la direccion "mongodb+srv" de Atlas. En ese caso usamos DNS publicos.
if (dns.getServers().every((s) => s === '127.0.0.1' || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todas las rutas quedan bajo /api (ej: /api/auth/login)
  app.setGlobalPrefix('api');

  // Permite que el front (otro dominio/puerto) le pegue a la API
  const origenes = ['http://localhost:4200'];
  if (process.env.FRONT_URL) origenes.push(process.env.FRONT_URL);
  app.enableCors({ origin: origenes, credentials: true });

  // Valida automaticamente los DTOs en todas las rutas.
  // whitelist: descarta campos que no esten en el DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);
  console.log(`API corriendo en http://localhost:${puerto}/api`);
}
bootstrap();
