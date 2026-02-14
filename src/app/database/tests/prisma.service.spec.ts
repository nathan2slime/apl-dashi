import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppConfig } from '~/config';

const { prismaPg, MockPrismaClient } = vi.hoisted(() => {
  const prismaPgFn = vi.fn();

  class PrismaClientMock {
    public options: unknown;
    $connect = vi.fn();
    $disconnect = vi.fn();

    constructor(options: unknown) {
      this.options = options;
    }
  }

  return {
    prismaPg: prismaPgFn,
    MockPrismaClient: PrismaClientMock
  };
});

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class {
    constructor(...args: unknown[]) {
      prismaPg(...args);
    }
  }
}));

vi.mock('~/generated/prisma/client', () => ({
  PrismaClient: MockPrismaClient
}));

import { PrismaService } from '~/app/database/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    prismaPg.mockReset();
    prismaPg.mockReturnValue({ mocked: true });

    const config = new ConfigService<AppConfig>();
    config.set('DATABASE_URL', 'postgresql://localhost:5432/app');

    service = new PrismaService(config);
  });

  it('should build prisma adapter with database url', () => {
    expect(prismaPg).toHaveBeenCalledWith({
      connectionString: 'postgresql://localhost:5432/app'
    });
  });

  it('should connect on module init', async () => {
    await service.onModuleInit();

    expect(service.$connect).toHaveBeenCalled();
  });

  it('should not throw when connect fails', async () => {
    vi.mocked(service.$connect).mockRejectedValue(new Error('connect error'));

    await expect(service.onModuleInit()).resolves.toBeUndefined();
  });

  it('should disconnect on module destroy', async () => {
    await service.onModuleDestroy();

    expect(service.$disconnect).toHaveBeenCalled();
  });
});
