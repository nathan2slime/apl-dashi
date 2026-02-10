import { Module } from '@nestjs/common';

import { UserController } from '~/app/user/user.controller';
import { UserService } from '~/app/user/user.service';

@Module({
  imports: [],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
