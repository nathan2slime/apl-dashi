import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssetDto } from '~/app/asset/asset.dto';
import { AssetService } from '~/app/asset/asset.service';
import { PrismaService } from '~/app/database/prisma.service';
import { AssetProvider } from '~/generated/prisma/enums';

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
    service = new AssetService(prisma as unknown as PrismaService);
  });

  it('should create asset', async () => {
    const data: AssetDto = {
      key: 'k1',
      url: 'https://cdn/a.png',
      provider: AssetProvider.AWS_S3
    };
    const asset = { id: 'a1', ...data };
    prisma.asset.create.mockResolvedValue(asset);

    const result = await service.create(data);

    expect(prisma.asset.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(asset);
  });

  it('should delete by key', async () => {
    prisma.asset.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.deleteByKey('k1');

    expect(prisma.asset.deleteMany).toHaveBeenCalledWith({
      where: { key: 'k1' }
    });
    expect(result).toEqual({ count: 1 });
  });
});
