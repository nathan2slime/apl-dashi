import { Module } from '@nestjs/common';

import { AssetModule } from '~/app/asset/asset.module';
import { UploadService } from '~/app/upload/upload.service';

@Module({
  controllers: [],
  providers: [UploadService],
  exports: [UploadService],
  imports: [AssetModule]
})
export class UploadModule {}
