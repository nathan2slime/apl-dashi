import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createId } from '@paralleldrive/cuid2';
import { User } from '~/generated/prisma/client';

import { RedisService } from '~/app/database/redis.service';
import { Session } from '~/app/session/session.model';
import { AppConfig } from '~/config';

@Injectable()
export class SessionService {
  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly redisService: RedisService
  ) {}
  private readonly logger = new Logger(SessionService.name);

  getSessionKey(id: string) {
    this.logger.log(`Generating session key for ID: ${id}`);
    return 'session'.concat(':', id);
  }

  getUserSessionKey(id: string) {
    this.logger.log(`Generating user session key for user ID: ${id}`);
    return 'user'.concat(':', 'session', ':', id);
  }

  async create(user: Omit<User, 'password'>) {
    this.logger.log(`Creating session for user ID: ${user.id}`);
    const session: Session = {
      id: createId(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.logger.log(`Storing session with ID: ${session.id} in Redis`);

    await this.redisService.set(
      this.getSessionKey(session.id),
      session,
      Math.floor(require('ms')(this.config.get('SESSION_EXPIRES_IN')) / 1000)
    );
    this.logger.log(`Session with ID: ${session.id} stored in Redis`);
    await this.redisService.sAdd(this.getUserSessionKey(user.id), session.id);
    this.logger.log(
      `Session ID: ${session.id} added to user sessions for user ID: ${user.id}`
    );
    return session;
  }

  async expire(id: string) {
    await this.redisService.del(this.getSessionKey(id));
    await this.redisService.del(this.getUserSessionKey(id));
  }

  async deleteAllByUserId(userId: string) {
    const sessions = await this.redisService.sMembers(
      this.getUserSessionKey(userId)
    );

    for (const sessionId of sessions) {
      await this.redisService.del(this.getSessionKey(sessionId));
    }

    await this.redisService.sClear(this.getUserSessionKey(userId));
  }

  async findById(id: string) {
    return this.redisService.get<Session>(this.getSessionKey(id));
  }
}
