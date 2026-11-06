import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // Lee el archivo .env y lo deja disponible en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexion a MongoDB usando la URI del .env
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    CloudinaryModule,
    UsuariosModule,
    AuthModule,
    PublicacionesModule,
  ],
})
export class AppModule {}
