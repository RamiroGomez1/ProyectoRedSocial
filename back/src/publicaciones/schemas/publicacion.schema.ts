/** Schema de Mongo para las publicaciones. */
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

  // URL de Cloudinary (opcional)
  @Prop({ default: '' })
  imagen: string;

  // Referencia al usuario que la creo (con populate traemos sus datos)
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  // Ids de los usuarios que le dieron me gusta (sin repetidos)
  @Prop({ type: [{ type: Types.ObjectId, ref: Usuario.name }], default: [] })
  meGusta: Types.ObjectId[];

  // Contador para poder ordenar por me gusta rapido
  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: 0 })
  cantidadComentarios: number;

  // Baja logica: no se borra, se marca como inactiva
  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
