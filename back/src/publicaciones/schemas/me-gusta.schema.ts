import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';
import { Publicacion } from './publicacion.schema';

export type MeGustaDocument = HydratedDocument<MeGusta>;

@Schema({ timestamps: true })
export class MeGusta {
  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true, index: true })
  publicacion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;
}

export const MeGustaSchema = SchemaFactory.createForClass(MeGusta);
