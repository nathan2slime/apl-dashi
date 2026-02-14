import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssetService } from '~/app/asset/asset.service';
import { UploadService } from '~/app/upload/upload.service';
import { AppBucket } from '~/config/storage';
import { AssetProvider } from '~/generated/prisma/enums';

const createDriver = {
  upload: vi.fn()
};

const deleteDriver = {
  delete: vi.fn()
};

const createFactory = vi.fn(() => createDriver);
const deleteFactory = vi.fn(() => deleteDriver);

vi.mock('~/app/upload/upload.factory', () => ({
  UploadFactory: {
    create: (...args: unknown[]) => createFactory(...args),
    delete: (...args: unknown[]) => deleteFactory(...args)
  }
}));

describe('UploadService', () => {
  let service: UploadService;
  let config: ConfigService;
  let assetService: AssetService;

  beforeEach(() => {
    config = new ConfigService();

    assetService = {
      create: vi.fn(),
      deleteByKey: vi.fn()
    } as unknown as AssetService;

    createDriver.upload.mockReset();
    deleteDriver.delete.mockReset();
    createFactory.mockClear();
    deleteFactory.mockClear();
    vi.mocked(assetService.create).mockReset();
    vi.mocked(assetService.deleteByKey).mockReset();

    service = new UploadService(config as ConfigService<any>, assetService);
  });

  it('should upload file and create asset', async () => {
    createDriver.upload.mockResolvedValue({
      url: 'https://cdn/file.jpg',
      key: 'file.jpg'
    });
    vi.mocked(assetService.create).mockResolvedValue({ id: 'a1' } as any);

    const result = await service.upload({
      file: { originalname: 'file.jpg' } as Express.Multer.File,
      bucket: AppBucket.POST,
      provider: AssetProvider.AWS_S3
    });

    expect(createFactory).toHaveBeenCalledWith(
      AssetProvider.AWS_S3,
      config,
      AppBucket.POST
    );
    expect(createDriver.upload).toHaveBeenCalled();
    expect(assetService.create).toHaveBeenCalledWith({
      url: 'https://cdn/file.jpg',
      key: 'file.jpg',
      provider: AssetProvider.AWS_S3
    });
    expect(result).toEqual({ id: 'a1' });
  });

  it('should throw when upload fails', async () => {
    createDriver.upload.mockRejectedValue(new Error('fail'));

    await expect(
      service.upload({
        file: {} as Express.Multer.File,
        bucket: AppBucket.POST
      })
    ).rejects.toThrowError('Internal Server Error');
  });

  it('should delete asset from db and provider', async () => {
    vi.mocked(assetService.deleteByKey).mockResolvedValue({ count: 1 } as any);
    deleteDriver.delete.mockResolvedValue(undefined);

    await service.deleteByAsset(
      { key: 'k1', provider: AssetProvider.AWS_S3 } as any,
      AppBucket.POST
    );

    expect(deleteFactory).toHaveBeenCalledWith(
      AssetProvider.AWS_S3,
      config,
      AppBucket.POST
    );
    expect(assetService.deleteByKey).toHaveBeenCalledWith('k1');
    expect(deleteDriver.delete).toHaveBeenCalledWith('k1');
  });

  it('should throw when delete fails', async () => {
    vi.mocked(assetService.deleteByKey).mockRejectedValue(new Error('fail'));

    await expect(
      service.deleteByAsset(
        { key: 'k1', provider: AssetProvider.AWS_S3 } as any,
        AppBucket.POST
      )
    ).rejects.toThrowError('Internal Server Error');
  });
});
