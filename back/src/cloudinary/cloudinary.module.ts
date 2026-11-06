/** Módulo global que expone el servicio para subir imágenes. */
import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

// @Global: cualquier modulo puede inyectar CloudinaryService sin importarlo
@Global()
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
