import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';
import { Publicacion } from './publicacion.schema';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true, index: true })
  publicacion: Types.ObjectId;

  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
