import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { Request } from '~/@types/app';
import { SessionService } from '~/app/session/session.service';
import { AppConfig } from '~/config';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy, 'cookie') {
  constructor(
    private readonly sessionService: SessionService,
    private readonly config: ConfigService<AppConfig>
  ) {
    super();
  }

  async validate(req: Request) {
    const cookies = req.cookies;
    const sessionId = cookies[this.config.get('SESSION_COOKIE')];

    if (!sessionId) throw new UnauthorizedException();

    const session = await this.sessionService.findById(sessionId);

    if (!session) throw new UnauthorizedException();

    return session;
  }
}
