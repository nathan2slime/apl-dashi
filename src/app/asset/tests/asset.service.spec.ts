import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssetService } from '~/app/asset/asset.service';

describe('AssetService', () => {
  let service: AssetService;
  const prisma = {
    asset: {
      create: vi.fn(),
      deleteMany: vi.fn()
    }
  };

  beforeEach(() => {
    prisma.asset.create.mockReset();
    prisma.asset.deleteMany.mockReset();
    service = new AssetService(prisma as any);
  });

  it('should create asset', async () => {
    const data = { key: 'k1', url: 'https://cdn/a.png', provider: 'AWS_S3' };
    const asset = { id: 'a1', ...data };
    prisma.asset.create.mockResolvedValue(asset);

    const result = await service.create(data as any);

    expect(prisma.asset.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(asset);
  });

  it('should delete by key', async () => {
    prisma.asset.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.deleteByKey('k1');

    expect(prisma.asset.deleteMany).toHaveBeenCalledWith({ where: { key: 'k1' } });
    expect(result).toEqual({ count: 1 });
  });
});
