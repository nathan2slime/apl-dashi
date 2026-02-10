import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';

import { AppConfig } from '~/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  private readonly logger = new Logger(RedisService.name);

  private client: RedisClientType;

  async onModuleInit() {
    try {
      this.client = createClient({
        socket: {
          host: this.config.get('REDIS_HOST', { infer: true }),
          port: this.config.get('REDIS_PORT', { infer: true })
        },
        password: this.config.get('REDIS_PASSWORD', { infer: true })
      });

      this.client.on('error', err => this.logger.error(err));
      await this.client.connect();
      this.logger.debug('Connection established successfully');
    } catch (error) {
      this.logger.error('Error establishing connection', error);
    }
  }

  async check() {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis ping failed', error);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async sAdd(key: string, member: string): Promise<void> {
    await this.client.sAdd(key, member);
  }

  async sRem(key: string, member: string): Promise<void> {
    await this.client.sRem(key, member);
  }

  async sMembers(key: string): Promise<string[]> {
    return this.client.sMembers(key);
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number | null = null
  ): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.set(key, stringValue, { EX: ttlSeconds });
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get<T = object>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async sClear(key: string): Promise<void> {
    const members = await this.client.sMembers(key);

    if (members.length > 0) {
      await this.client.sRem(key, members);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }
}
