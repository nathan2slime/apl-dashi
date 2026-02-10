import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import type { Request } from '~/@types/app';
import { CookieAuthGuard } from '~/app/auth/auth.guard';
import { PrismaService } from '~/app/database/prisma.service';
import { CreatePostDto, PaginatePostsDto } from '~/app/post/post.dto';
import { PostService } from '~/app/post/post.service';
import { UploadService } from '~/app/upload/upload.service';
import { AppBucket } from '~/config/storage';
import { Asset } from '~/generated/prisma/client';

@Controller('posts')
@ApiTags('Posts')
@UseGuards(CookieAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService
  ) {}

  private readonly logger = new Logger(PostController.name);

  @Post('create')
  @UseInterceptors(FilesInterceptor('attachments', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attachments: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  async create(
    @Body() body: CreatePostDto,
    @Req() req: Request,
    @UploadedFiles() attachments: Express.Multer.File[],

    @Res() res: Response
  ) {
    const assets: Asset[] = [];
    this.logger.log('Starting post creation process');
    try {
      for (let index = 0; index < attachments.length; index++) {
        const file = attachments[index];

        const asset = await this.uploadService.upload({
          file,
          bucket: AppBucket.PostAttachments
        });
        assets.push(asset);
      }

      this.logger.log(
        'All attachments uploaded successfully, proceeding to create post in database'
      );
      const post = await this.prisma.$transaction(async prisma => {
        const data = await this.postService.create(
          body,
          req.user.userId,
          prisma
        );
        return this.postService.attachAssets(data.id, assets, prisma);
      });

      this.logger.log(`Post created successfully with ID: ${post.id}`);

      return res.status(HttpStatus.CREATED).json(post);
    } catch (error) {
      this.logger.debug(
        'Error occurred during post creation, initiating cleanup of uploaded assets'
      );
      for (let index = 0; index < assets.length; index++) {
        const asset = assets[index];
        await this.uploadService.deleteByAsset(
          asset,
          AppBucket.PostAttachments
        );
      }
      this.logger.error(error);
      return res.status(HttpStatus.BAD_GATEWAY).json(error);
    }
  }

  @Get('paginate')
  async feed(@Res() res: Response, @Query() query: PaginatePostsDto) {
    this.logger.log('Paginating posts with query:', query);
    const data = await this.postService.paginate(query);
    this.logger.log('Posts paginated successfully');

    return res.status(HttpStatus.OK).json(data);
  }

  @Get('item/:id')
  async item(@Res() res: Response, @Param('id') id: string) {
    this.logger.log(`Fetching post item with ID: ${id}`);
    const item = await this.postService.getById(id);
    const children = await this.postService.getChildren(id);
    this.logger.log(`Post item with ID: ${id} fetched successfully`);
    const data = {
      item,
      children
    };

    return res.status(HttpStatus.OK).json(data);
  }
}
