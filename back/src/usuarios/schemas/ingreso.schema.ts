import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from './usuario.schema';

export type IngresoDocument = HydratedDocument<Ingreso>;

@Schema({ timestamps: true })
export class Ingreso {
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true, index: true })
  usuario!: Types.ObjectId;
}

export const IngresoSchema = SchemaFactory.createForClass(Ingreso);
