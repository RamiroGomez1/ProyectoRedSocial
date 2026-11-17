import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'esPublica';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
