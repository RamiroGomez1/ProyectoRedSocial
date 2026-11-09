import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async subirImagen(
    archivo: Express.Multer.File,
    carpeta: string,
    ancho = 800,
  ): Promise<string> {
    const buffer = await sharp(archivo.buffer)
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    try {
      const resultado = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: `red-social/${carpeta}` },
              (error, res) => {
                if (error || !res) return reject(error);
                resolve(res);
              },
            )
            .end(buffer);
        },
      );
      return resultado.secure_url;
    } catch {
      throw new InternalServerErrorException('No se pudo subir la imagen');
    }
  }
}
