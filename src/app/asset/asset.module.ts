import { Module } from '@nestjs/common';

import { AssetService } from '~/app/asset/asset.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AssetService],
  exports: [AssetService]
})
export class AssetModule {}
