import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PayloadToken } from '../auth/interfaces/payload.interface';
import { Perfil } from '../usuarios/schemas/usuario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';

export const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async crear(
    dto: CrearPublicacionDto,
    autorId: string,
    imagen?: Express.Multer.File,
  ) {
    const urlImagen = imagen
      ? await this.cloudinaryService.subirImagen(imagen, 'publicaciones', 1080)
      : '';

    const creada = await this.publicacionModel.create({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagen: urlImagen,
      autor: new Types.ObjectId(autorId),
    });

    const publicacion = await this.publicacionModel
      .findById(creada._id)
      .populate('autor', CAMPOS_AUTOR)
      .lean();
    return this.formatear(publicacion, autorId);
  }

  async listar(query: ListarPublicacionesDto, usuarioActualId: string) {
    const filtro: Record<string, unknown> = { activa: true };
    if (query.usuario) filtro.autor = new Types.ObjectId(query.usuario);

    const orden: Record<string, 1 | -1> =
      query.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(orden)
        .skip(query.offset)
        .limit(query.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.publicacionModel.countDocuments(filtro),
    ]);

    return {
      publicaciones: publicaciones.map((p) => this.formatear(p, usuarioActualId)),
      total,
      offset: query.offset,
      limit: query.limit,
    };
  }

  async eliminar(id: string, usuario: PayloadToken) {
    const publicacion = await this.buscarActiva(id);

    const esAutor = publicacion.autor.toString() === usuario.sub;
    const esAdmin = usuario.perfil === Perfil.ADMINISTRADOR;
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    publicacion.activa = false;
    await publicacion.save();
    return { mensaje: 'Publicación eliminada' };
  }

  async darMeGusta(id: string, usuarioId: string) {
    await this.buscarActiva(id);
    const uid = new Types.ObjectId(usuarioId);

    const resultado = await this.publicacionModel.updateOne(
      { _id: id, meGusta: { $ne: uid } },
      { $push: { meGusta: uid }, $inc: { cantidadMeGusta: 1 } },
    );
    if (resultado.modifiedCount === 0) {
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }
    return this.estadoMeGusta(id, true);
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    await this.buscarActiva(id);
    const uid = new Types.ObjectId(usuarioId);

    const resultado = await this.publicacionModel.updateOne(
      { _id: id, meGusta: uid },
      { $pull: { meGusta: uid }, $inc: { cantidadMeGusta: -1 } },
    );
    if (resultado.modifiedCount === 0) {
      throw new ConflictException('No le habías dado me gusta a esta publicación');
    }
    return this.estadoMeGusta(id, false);
  }

  async buscarActiva(id: string): Promise<PublicacionDocument> {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true });
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }
    return publicacion;
  }

  async sumarComentario(id: string) {
    await this.publicacionModel.updateOne({ _id: id }, { $inc: { cantidadComentarios: 1 } });
  }

  private async estadoMeGusta(id: string, leDiMeGusta: boolean) {
    const publicacion = await this.publicacionModel.findById(id).select('cantidadMeGusta');
    return {
      cantidadMeGusta: publicacion?.cantidadMeGusta ?? 0,
      leDiMeGusta,
    };
  }

  private formatear(publicacion: any, usuarioActualId: string) {
    const { meGusta, activa, __v, ...resto } = publicacion;
    return {
      ...resto,
      leDiMeGusta: (meGusta ?? []).some(
        (id: Types.ObjectId) => id.toString() === usuarioActualId,
      ),
    };
  }
}
