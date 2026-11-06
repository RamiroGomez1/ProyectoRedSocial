/** Lógica de comentarios: listar paginado y crear. */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { CAMPOS_AUTOR, PublicacionesService } from './publicaciones.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { PaginacionDto } from './dto/paginacion.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  // Comentarios de una publicacion, los mas recientes primero, paginados
  async listar(publicacionId: string, paginacion: PaginacionDto) {
    await this.publicacionesService.buscarActiva(publicacionId);
    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(paginacion.offset)
        .limit(paginacion.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { comentarios, total, offset: paginacion.offset, limit: paginacion.limit };
  }

  // Crea un comentario y suma 1 al contador de la publicación.
  async crear(publicacionId: string, dto: CrearComentarioDto, autorId: string) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const creado = await this.comentarioModel.create({
      mensaje: dto.mensaje,
      autor: new Types.ObjectId(autorId),
      publicacion: new Types.ObjectId(publicacionId),
    });
    await this.publicacionesService.sumarComentario(publicacionId);

    return this.comentarioModel
      .findById(creado._id)
      .populate('autor', CAMPOS_AUTOR)
      .lean();
  }
}
