import { Injectable, Logger } from '@nestjs/common';

import { AssetDto } from '~/app/asset/asset.dto';
import { PrismaService } from '~/app/database/prisma.service';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(AssetService.name);

  async create(data: AssetDto) {
    this.logger.log('Creating new asset');
    const asset = await this.prisma.asset.create({
      data
    });
    this.logger.log(`Asset created with ID: ${asset.id}`);

    return asset;
  }

  async deleteByKey(key: string) {
    return this.prisma.asset.deleteMany({
      where: { key }
    });
  }
}
