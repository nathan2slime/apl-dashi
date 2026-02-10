import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '~/app/auth/auth.controller';
import { AuthService } from '~/app/auth/auth.service';
import { CookieStrategy } from '~/app/auth/auth.strategy';
import { SessionModule } from '~/app/session/session.module';
import { UserModule } from '~/app/user/user.module';
import { CookieService } from '~/utils/cookie.service';

@Module({
  imports: [PassportModule, UserModule, SessionModule],
  controllers: [AuthController],
  providers: [AuthService, CookieStrategy, CookieService],
  exports: [AuthService]
})
export class AuthModule {}
