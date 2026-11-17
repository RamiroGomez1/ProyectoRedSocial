import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { PayloadToken } from './interfaces/payload.interface';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;

@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 10 } })
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
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.authService.registro(dto, imagen);
  }

  @Public()
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 10 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  autorizar(@UsuarioActual() usuario: PayloadToken) {
    return this.authService.autorizar(usuario);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  refrescar(@UsuarioActual() usuario: PayloadToken) {
    return this.authService.refrescar(usuario);
  }
}
