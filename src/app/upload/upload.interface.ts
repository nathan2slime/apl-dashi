import { AppBucket } from '~/config/storage';
import { AssetProvider } from '~/generated/prisma/enums';

export interface UploadResult {
  url: string;
  key: string;
}

export type UploadArgs = {
  file: Express.Multer.File;
} & Partial<{
  bucket: AppBucket;
  provider: AssetProvider;
}>;

export interface UploadDriver {
  upload(file: Express.Multer.File): Promise<UploadResult>;
  delete(key: string, bucket: AppBucket): Promise<void>;
}
