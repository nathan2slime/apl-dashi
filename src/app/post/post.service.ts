import { Injectable } from '@nestjs/common';

import { PrismaService } from '~/app/database/prisma.service';
import { CreatePostDto, PaginatePostsDto } from '~/app/post/post.dto';
import { Asset, Prisma } from '~/generated/prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreatePostDto,
    userId: string,
    prisma: Prisma.TransactionClient = this.prisma
  ) {
    return prisma.post.create({
      data: {
        content: payload.content,
        authorId: userId,
        tags: payload.tags,
        parentId: payload.parentId,
        latitude: payload.latitude,
        longitude: payload.longitude
      }
    });
  }

  async attachAssets(
    postId: string,
    assets: Asset[],
    prisma: Prisma.TransactionClient = this.prisma
  ) {
    const assetIds = assets.map(asset => asset.id);
    return prisma.post.update({
      where: { id: postId },
      data: {
        attachments: {
          connect: assetIds.map(id => ({ id }))
        }
      },
      include: {
        attachments: true
      }
    });
  }

  async getParentId(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { parentId: true }
    });

    return post;
  }

  async getById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  async getChildren(id: string) {
    return this.prisma.post.findMany({
      where: { parentId: id },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  async paginate(query: PaginatePostsDto) {
    return this.prisma.post.findMany({
      take: query.limit ?? 10,
      ...(query.cursor && {
        cursor: {
          id: query.cursor
        },
        skip: 1
      }),
      where: {
        parentId: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }
}
