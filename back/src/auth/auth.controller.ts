/** Rutas de autenticación: POST /auth/registro y POST /auth/login. */
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

const TAMANIO_MAXIMO = 2 * 1024 * 1024; // 2 MB

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/registro  -> 201 Created
  @Post('registro')
  @UseInterceptors(
    // Multer lee el campo "imagenPerfil" del form-data y lo deja en memoria
    FileInterceptor('imagenPerfil', {
      limits: { fileSize: TAMANIO_MAXIMO },
      fileFilter: (req, archivo, callback) => {
        if (!archivo.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('El archivo debe ser una imagen'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  registro(
    @Body() dto: RegistroDto,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    if (!imagen) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    return this.authService.registro(dto, imagen);
  }

  // POST /api/auth/login  -> 200 OK (no crea nada, por eso no es 201)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
