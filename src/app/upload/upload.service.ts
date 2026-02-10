import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetService } from '~/app/asset/asset.service';
import { UploadFactory } from '~/app/upload/upload.factory';
import { UploadArgs } from '~/app/upload/upload.interface';

import { AppConfig } from '~/config';
import { AppBucket } from '~/config/storage';
import { Asset } from '~/generated/prisma/client';
import { AssetProvider } from '~/generated/prisma/enums';

@Injectable()
export class UploadService {
  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly assetService: AssetService
  ) {}
  private readonly logger = new Logger(UploadService.name);

  async upload({ file, provider = AssetProvider.AWS_S3, bucket }: UploadArgs) {
    try {
      this.logger.log(
        `Uploading file to bucket: ${bucket} using provider: ${provider}`
      );

      const driver = UploadFactory.create(provider, this.config, bucket);

      const { url, key } = await driver.upload(file);
      this.logger.log(`File uploaded with key: ${key} and url: ${url}`);

      return this.assetService.create({
        url,
        key,
        provider
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async deleteByAsset(asset: Asset, bucket: AppBucket) {
    try {
      this.logger.log(
        `Deleting asset with key: ${asset.key} from bucket: ${bucket}`
      );
      const driver = UploadFactory.delete(asset.provider, this.config, bucket);

      await this.assetService.deleteByKey(asset.key);
      await driver.delete(asset.key);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
