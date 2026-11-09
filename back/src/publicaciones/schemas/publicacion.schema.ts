import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: Usuario.name }], default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: 0 })
  cantidadComentarios: number;

  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
