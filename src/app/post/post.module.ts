import { Module } from '@nestjs/common';

import { PostController } from '~/app/post/post.controller';
import { PostService } from '~/app/post/post.service';
import { UploadModule } from '~/app/upload/upload.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [UploadModule]
})
export class PostModule {}
