import { ConfigService } from '@nestjs/config';
import { S3UploadProvider } from '~/app/upload/providers/s3.provider';
import { UploadDriver } from '~/app/upload/upload.interface';

import { AppConfig } from '~/config';
import { AppBucket } from '~/config/storage';
import { AssetProvider } from '~/generated/prisma/enums';

export class UploadFactory {
  static create(
    provider: AssetProvider,
    config: ConfigService<AppConfig>,
    bucket: AppBucket | undefined = undefined
  ): UploadDriver {
    switch (provider) {
      case AssetProvider.AWS_S3:
        return new S3UploadProvider(config, bucket);
      default:
        throw new Error('Unsupported asset provider');
    }
  }

  static delete(
    provider: AssetProvider,
    config: ConfigService<AppConfig>,
    bucket: AppBucket | undefined = undefined
  ) {
    switch (provider) {
      case AssetProvider.AWS_S3:
        return new S3UploadProvider(config, bucket);
      default:
        throw new Error('Unsupported asset provider');
    }
  }
}
