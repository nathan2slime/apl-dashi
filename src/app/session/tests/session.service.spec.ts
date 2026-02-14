import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisService } from '~/app/database/redis.service';
import { SessionService } from '~/app/session/session.service';

const createId = vi.fn();

vi.mock('@paralleldrive/cuid2', () => ({
  createId: () => createId()
}));

describe('SessionService', () => {
  let service: SessionService;
  let config: ConfigService;
  let redisService: RedisService;

  beforeEach(() => {
    config = new ConfigService();
    config.set('SESSION_EXPIRES_IN', '1d');

    redisService = {
      set: vi.fn(),
      sAdd: vi.fn(),
      del: vi.fn(),
      sMembers: vi.fn(),
      sClear: vi.fn(),
      get: vi.fn()
    } as unknown as RedisService;

    service = new SessionService(
      config as ConfigService<any>,
      redisService as RedisService
    );
  });

  it('should generate session key', () => {
    expect(service.getSessionKey('abc')).toBe('session:abc');
  });

  it('should generate user session key', () => {
    expect(service.getUserSessionKey('u1')).toBe('user:session:u1');
  });

  it('should create and persist session in redis', async () => {
    createId.mockReturnValue('session-id');

    const result = await service.create({
      id: 'user-1',
      email: 'a@a.com',
      username: 'john',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false
    });

    expect(result.id).toBe('session-id');
    expect(result.userId).toBe('user-1');
    expect(redisService.set).toHaveBeenCalledWith(
      'session:session-id',
      expect.objectContaining({ id: 'session-id', userId: 'user-1' }),
      86400
    );
    expect(redisService.sAdd).toHaveBeenCalledWith('user:session:user-1', 'session-id');
  });

  it('should expire session keys', async () => {
    await service.expire('session-id');

    expect(redisService.del).toHaveBeenNthCalledWith(1, 'session:session-id');
    expect(redisService.del).toHaveBeenNthCalledWith(2, 'user:session:session-id');
  });

  it('should delete all user sessions', async () => {
    vi.mocked(redisService.sMembers).mockResolvedValue(['s1', 's2']);

    await service.deleteAllByUserId('u1');

    expect(redisService.sMembers).toHaveBeenCalledWith('user:session:u1');
    expect(redisService.del).toHaveBeenNthCalledWith(1, 'session:s1');
    expect(redisService.del).toHaveBeenNthCalledWith(2, 'session:s2');
    expect(redisService.sClear).toHaveBeenCalledWith('user:session:u1');
  });

  it('should find session by id', async () => {
    const session = { id: 's1', userId: 'u1', createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(redisService.get).mockResolvedValue(session);

    const result = await service.findById('s1');

    expect(redisService.get).toHaveBeenCalledWith('session:s1');
    expect(result).toEqual(session);
  });
});
