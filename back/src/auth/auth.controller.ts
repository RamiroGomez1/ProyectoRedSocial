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

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
