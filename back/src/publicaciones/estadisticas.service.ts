import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { RangoFechasDto } from './dto/rango-fechas.dto';

const DIAS_POR_DEFECTO = 30;

export interface Rango {
  desde: Date;
  hasta: Date;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Usuario.name)
    private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async publicacionesPorUsuario(query: RangoFechasDto) {
    const rango = this.resolverRango(query);

    const datos = await this.publicacionModel.aggregate([
      { $match: { activa: true, createdAt: this.entre(rango) } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.usuarioModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$usuario.nombreUsuario',
          nombre: { $concat: ['$usuario.nombre', ' ', '$usuario.apellido'] },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1, nombreUsuario: 1 } },
    ]);

    return this.respuesta(rango, datos);
  }

  async comentariosPorDia(query: RangoFechasDto) {
    const rango = this.resolverRango(query);

    const datos = await this.comentarioModel.aggregate([
      { $match: { createdAt: this.entre(rango) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
      { $sort: { fecha: 1 } },
    ]);

    return this.respuesta(rango, datos);
  }

  async comentariosPorPublicacion(query: RangoFechasDto) {
    const rango = this.resolverRango(query);

    const datos = await this.comentarioModel.aggregate([
      { $match: { createdAt: this.entre(rango) } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activa': true } },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$publicacion.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1, titulo: 1 } },
      { $limit: 10 },
    ]);

    return this.respuesta(rango, datos);
  }

  private entre(rango: Rango) {
    return { $gte: rango.desde, $lte: rango.hasta };
  }

  private respuesta<T>(rango: Rango, datos: T[]) {
    return {
      desde: rango.desde.toISOString(),
      hasta: rango.hasta.toISOString(),
      datos,
    };
  }

  private resolverRango(query: RangoFechasDto): Rango {
    const hasta = query.hasta ? new Date(query.hasta) : new Date();
    hasta.setHours(23, 59, 59, 999);

    const desde = query.desde
      ? new Date(query.desde)
      : new Date(hasta.getTime() - DIAS_POR_DEFECTO * 24 * 60 * 60 * 1000);
    desde.setHours(0, 0, 0, 0);

    return { desde, hasta };
  }
}
