import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisService } from '~/app/database/redis.service';
import { AppConfig } from '~/config';

const createClient = vi.fn();

vi.mock('redis', () => ({
  createClient: (...args: unknown[]) => createClient(...args)
}));

describe('RedisService', () => {
  let service: RedisService;
  const client = {
    on: vi.fn(),
    connect: vi.fn(),
    ping: vi.fn(),
    quit: vi.fn(),
    sAdd: vi.fn(),
    sRem: vi.fn(),
    sMembers: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn()
  };
  const setClient = (instance: RedisService) => {
    (
      instance as unknown as {
        client: RedisClientType;
      }
    ).client = client as unknown as RedisClientType;
  };

  beforeEach(() => {
    for (const fn of Object.values(client)) {
      if (typeof fn === 'function') {
        fn.mockReset();
      }
    }

    createClient.mockReset();
    createClient.mockReturnValue(client);

    const config = new ConfigService<AppConfig>();
    config.set('REDIS_HOST', 'localhost');
    config.set('REDIS_PORT', 6379);
    config.set('REDIS_PASSWORD', 'secret');

    service = new RedisService(config);
  });

  it('should initialize redis client on module init', async () => {
    client.connect.mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(createClient).toHaveBeenCalledWith({
      socket: { host: 'localhost', port: 6379 },
      password: 'secret'
    });
    expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(client.connect).toHaveBeenCalled();
  });

  it('should check redis health', async () => {
    setClient(service);
    client.ping.mockResolvedValue('PONG');

    await expect(service.check()).resolves.toBe(true);
  });

  it('should return false when check fails', async () => {
    setClient(service);
    client.ping.mockRejectedValue(new Error('down'));

    await expect(service.check()).resolves.toBe(false);
  });

  it('should quit client on module destroy', async () => {
    setClient(service);
    client.quit.mockResolvedValue('OK');

    await service.onModuleDestroy();

    expect(client.quit).toHaveBeenCalled();
  });

  it('should set with ttl', async () => {
    setClient(service);

    await service.set('k1', { a: 1 }, 60);

    expect(client.set).toHaveBeenCalledWith('k1', JSON.stringify({ a: 1 }), {
      EX: 60
    });
  });

  it('should set without ttl', async () => {
    setClient(service);

    await service.set('k1', { a: 1 });

    expect(client.set).toHaveBeenCalledWith('k1', JSON.stringify({ a: 1 }));
  });

  it('should get parsed json', async () => {
    setClient(service);
    client.get.mockResolvedValue('{"a":1}');

    const result = await service.get('k1');

    expect(result).toEqual({ a: 1 });
  });

  it('should return null when key does not exist', async () => {
    setClient(service);
    client.get.mockResolvedValue(null);

    const result = await service.get('k1');

    expect(result).toBeNull();
  });

  it('should clear set members', async () => {
    setClient(service);
    client.sMembers.mockResolvedValue(['a', 'b']);

    await service.sClear('set:1');

    expect(client.sMembers).toHaveBeenCalledWith('set:1');
    expect(client.sRem).toHaveBeenCalledWith('set:1', ['a', 'b']);
  });

  it('should not remove when set is empty', async () => {
    setClient(service);
    client.sMembers.mockResolvedValue([]);

    await service.sClear('set:1');

    expect(client.sRem).not.toHaveBeenCalled();
  });

  it('should return exists as boolean', async () => {
    setClient(service);
    client.exists.mockResolvedValue(1);

    await expect(service.exists('k1')).resolves.toBe(true);

    client.exists.mockResolvedValue(0);
    await expect(service.exists('k1')).resolves.toBe(false);
  });
});
