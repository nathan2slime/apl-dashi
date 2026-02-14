import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostService } from '~/app/post/post.service';

describe('PostService', () => {
  let service: PostService;
  const prisma = {
    post: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn()
    }
  };

  beforeEach(() => {
    prisma.post.create.mockReset();
    prisma.post.update.mockReset();
    prisma.post.findUnique.mockReset();
    prisma.post.findMany.mockReset();
    service = new PostService(prisma as any);
  });

  it('should create post', async () => {
    const payload = {
      content: 'hello',
      tags: ['nestjs'],
      parentId: null,
      latitude: 1,
      longitude: 2
    };

    prisma.post.create.mockResolvedValue({ id: 'p1' });

    await service.create(payload as any, 'u1');

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        content: payload.content,
        authorId: 'u1',
        tags: payload.tags,
        parentId: payload.parentId,
        latitude: payload.latitude,
        longitude: payload.longitude
      }
    });
  });

  it('should attach assets to post', async () => {
    prisma.post.update.mockResolvedValue({ id: 'p1', attachments: [] });

    await service.attachAssets('p1', [{ id: 'a1' }, { id: 'a2' }] as any);

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: {
        attachments: {
          connect: [{ id: 'a1' }, { id: 'a2' }]
        }
      },
      include: {
        attachments: true
      }
    });
  });

  it('should get parent id', async () => {
    prisma.post.findUnique.mockResolvedValue({ parentId: 'p0' });

    const result = await service.getParentId('p1');

    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      select: { parentId: true }
    });
    expect(result).toEqual({ parentId: 'p0' });
  });

  it('should get post by id with author info', async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 'p1' });

    await service.getById('p1');

    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });

  it('should get children by parent id', async () => {
    prisma.post.findMany.mockResolvedValue([]);

    await service.getChildren('p1');

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: { parentId: 'p1' },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });

  it('should paginate without cursor', async () => {
    prisma.post.findMany.mockResolvedValue([]);

    await service.paginate({ limit: 5 } as any);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      take: 5,
      where: { parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });

  it('should paginate with cursor', async () => {
    prisma.post.findMany.mockResolvedValue([]);

    await service.paginate({ limit: 10, cursor: 'p1' } as any);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      take: 10,
      cursor: { id: 'p1' },
      skip: 1,
      where: { parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });
});
