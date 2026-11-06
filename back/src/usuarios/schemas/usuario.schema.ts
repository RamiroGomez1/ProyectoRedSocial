import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

export enum Perfil {
  USUARIO = 'usuario',
  ADMINISTRADOR = 'administrador',
}

// timestamps: agrega createdAt y updatedAt automaticamente
@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  // unique: Mongo crea un indice y no deja repetir el correo
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario: string;

  // select: false -> la contraseña NO viene en las consultas,
  // salvo que la pidamos explicitamente con .select('+password')
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  // URL de la imagen guardada en Cloudinary
  @Prop({ default: '' })
  imagenPerfil: string;

  @Prop({ type: String, enum: Perfil, default: Perfil.USUARIO })
  perfil: Perfil;

  // Para la baja logica (Sprint 4)
  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
