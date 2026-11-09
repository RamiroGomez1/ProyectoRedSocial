import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dns from 'dns';

if (dns.getServers().every((s) => s === '127.0.0.1' || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const origenes = ['http://localhost:4200'];
  if (process.env.FRONT_URL) origenes.push(process.env.FRONT_URL);
  app.enableCors({ origin: origenes, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);
  console.log(`API corriendo en http://localhost:${puerto}/api`);
}
bootstrap();
