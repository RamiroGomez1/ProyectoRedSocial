import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { Ingreso, IngresoDocument } from './schemas/ingreso.schema';
import {
  VisitaPerfil,
  VisitaPerfilDocument,
} from './schemas/visita-perfil.schema';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Ingreso.name) private ingresoModel: Model<IngresoDocument>,
    @InjectModel(VisitaPerfil.name)
    private visitaPerfilModel: Model<VisitaPerfilDocument>,
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

  async perfilPublico(id: string, visitanteId: string) {
    const usuario = await this.buscarPorId(id);

    if (id !== visitanteId) {
      await this.visitaPerfilModel.create({
        perfil: usuario._id,
        visitante: new Types.ObjectId(visitanteId),
      });
    }

    const { correo, password, ...publico } = usuario.toObject();
    return publico;
  }

  async registrarIngreso(usuarioId: string) {
    await this.ingresoModel.create({ usuario: new Types.ObjectId(usuarioId) });
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

  async listarTodos(): Promise<UsuarioDocument[]> {
    return this.usuarioModel.find().sort({ createdAt: -1 });
  }

  async crearComoAdmin(
    dto: CrearUsuarioDto,
    imagen?: Express.Multer.File,
  ): Promise<UsuarioDocument> {
    const repetido = await this.campoRepetido(dto.correo, dto.nombreUsuario);
    if (repetido === 'correo') {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    if (repetido === 'nombreUsuario') {
      throw new ConflictException('Ese nombre de usuario ya esta en uso');
    }

    const passwordHasheada = await bcrypt.hash(dto.password, 10);

    const urlImagen = imagen
      ? await this.cloudinaryService.subirImagen(imagen, 'perfiles', 400)
      : '';

    const creado = await this.usuarioModel.create({
      ...dto,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      password: passwordHasheada,
      imagenPerfil: urlImagen,
    });

    return this.buscarPorId(creado._id.toString());
  }

  async cambiarEstado(
    id: string,
    activo: boolean,
    idDelAdmin: string,
  ): Promise<UsuarioDocument> {
    if (id === idDelAdmin) {
      throw new ConflictException(
        'No podés cambiar el estado de tu propio usuario',
      );
    }

    const usuario = await this.buscarPorId(id);

    if (usuario.activo === activo) {
      throw new ConflictException(
        activo
          ? 'El usuario ya estaba habilitado'
          : 'El usuario ya estaba deshabilitado',
      );
    }

    usuario.activo = activo;
    await usuario.save();
    return usuario;
  }
}
