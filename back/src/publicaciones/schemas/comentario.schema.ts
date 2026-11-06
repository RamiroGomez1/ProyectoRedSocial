/** Schema de Mongo para los comentarios. */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';
import { Publicacion } from './publicacion.schema';

export type ComentarioDocument = HydratedDocument<Comentario>;

// createdAt (de timestamps) es la fecha del comentario
@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true, index: true })
  publicacion: Types.ObjectId;

  // Se usa en el Sprint 3 cuando se edita un comentario
  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
