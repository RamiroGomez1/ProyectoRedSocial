import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    return this.usuarioModel.create(datos);
  }

  async campoRepetido(
    correo: string | undefined,
    nombreUsuario: string | undefined,
    excluirId?: string,
  ): Promise<'correo' | 'nombreUsuario' | null> {
    const condiciones: Record<string, unknown>[] = [];
    if (correo) condiciones.push({ correo: correo.toLowerCase() });
    if (nombreUsuario) condiciones.push({ nombreUsuario });
    if (!condiciones.length) return null;

    const filtro: Record<string, unknown> = { $or: condiciones };
    if (excluirId) filtro._id = { $ne: excluirId };

    const existente = await this.usuarioModel.findOne(filtro);
    if (!existente) return null;

    return correo && existente.correo === correo.toLowerCase()
      ? 'correo'
      : 'nombreUsuario';
  }

  buscarParaLogin(identificador: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel
      .findOne({
        $or: [
          { correo: identificador.toLowerCase() },
          { nombreUsuario: identificador },
        ],
      })
      .select('+password');
  }

  async buscarPorId(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  async actualizarPerfil(
    id: string,
    dto: ActualizarPerfilDto,
    imagen?: Express.Multer.File,
  ): Promise<UsuarioDocument> {
    const usuario = await this.buscarPorId(id);

    const repetido = await this.campoRepetido(
      dto.correo,
      dto.nombreUsuario,
      id,
    );
    if (repetido === 'correo') {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    if (repetido === 'nombreUsuario') {
      throw new ConflictException('Ese nombre de usuario ya esta en uso');
    }

    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.apellido !== undefined) usuario.apellido = dto.apellido;
    if (dto.correo !== undefined) usuario.correo = dto.correo;
    if (dto.nombreUsuario !== undefined) {
      usuario.nombreUsuario = dto.nombreUsuario;
    }
    if (dto.descripcion !== undefined) usuario.descripcion = dto.descripcion;
    if (dto.fechaNacimiento !== undefined) {
      usuario.fechaNacimiento = new Date(dto.fechaNacimiento);
    }

    if (imagen) {
      usuario.imagenPerfil = await this.cloudinaryService.subirImagen(
        imagen,
        'perfiles',
        400,
      );
    }

    await usuario.save();
    return usuario;
  }
}
