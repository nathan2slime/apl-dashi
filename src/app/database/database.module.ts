import { Global, Module } from '@nestjs/common';

import { PrismaService } from '~/app/database/prisma.service';
import { RedisService } from '~/app/database/redis.service';

@Global()
@Module({
  providers: [RedisService, PrismaService],
  exports: [RedisService, PrismaService]
})
export class DatabaseModule {}
