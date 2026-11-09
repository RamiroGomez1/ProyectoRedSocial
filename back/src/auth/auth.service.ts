import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registro(dto: RegistroDto, imagen: Express.Multer.File) {
    const repetido = await this.usuariosService.campoRepetido(
      dto.correo,
      dto.nombreUsuario,
    );
    if (repetido === 'correo') {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    if (repetido === 'nombreUsuario') {
      throw new ConflictException('Ese nombre de usuario ya esta en uso');
    }

    const passwordHasheada = await bcrypt.hash(dto.password, 10);

    const urlImagen = await this.cloudinaryService.subirImagen(
      imagen,
      'perfiles',
      400,
    );

    const usuario = await this.usuariosService.crear({
      ...dto,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      password: passwordHasheada,
      imagenPerfil: urlImagen,
    });

    return {
      mensaje: 'Usuario registrado correctamente',
      usuario: this.sinPassword(usuario),
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(
      dto.identificador,
    );

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const coincide = await bcrypt.compare(dto.password, usuario.password);
    if (!coincide) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('Tu usuario esta deshabilitado');
    }

    return {
      mensaje: 'Inicio de sesion exitoso',
      usuario: this.sinPassword(usuario),
    };
  }

  private sinPassword(usuario: UsuarioDocument) {
    const { password, ...resto } = usuario.toObject();
    return resto;
  }
}
