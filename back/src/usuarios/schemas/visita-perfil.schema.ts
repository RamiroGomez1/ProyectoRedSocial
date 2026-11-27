import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from './usuario.schema';

export type VisitaPerfilDocument = HydratedDocument<VisitaPerfil>;

@Schema({ timestamps: true })
export class VisitaPerfil {
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true, index: true })
  perfil!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  visitante!: Types.ObjectId;
}

export const VisitaPerfilSchema = SchemaFactory.createForClass(VisitaPerfil);
