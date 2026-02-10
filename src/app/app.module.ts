import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AssetModule } from '~/app/asset/asset.module';
import { AuthModule } from '~/app/auth/auth.module';
import { DatabaseModule } from '~/app/database/database.module';
import { HealthModule } from '~/app/health/health.module';
import { PostModule } from '~/app/post/post.module';
import { UploadModule } from '~/app/upload/upload.module';
import { CookieService } from '~/utils/cookie.service';

import config from '~/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    AuthModule,
    HttpModule,
    PostModule,
    DatabaseModule,
    AssetModule,
    HealthModule,
    UploadModule
  ],
  controllers: [],
  providers: [CookieService]
})
export class AppModule {}
