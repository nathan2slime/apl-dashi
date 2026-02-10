import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';

import { IsCuid } from '~/utils/cuuid.validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(300)
  @ApiProperty({ required: true, maxLength: 300 })
  content: string;

  @IsArray({ always: true })
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true
  })
  @IsOptional()
  attachments: string[];

  @ApiProperty({ required: false, nullable: true, default: null })
  @IsCuid()
  @IsOptional()
  parentId: string;

  @IsString()
  @ApiProperty({ required: true })
  longitude: string;

  @IsString()
  @ApiProperty({ required: true })
  latitude: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ type: [String], required: false, default: [] })
  tags: string[];
}

export class PaginatePostsDto {
  @IsOptional()
  @IsCuid()
  @ApiProperty({ required: false })
  cursor: string;

  @IsOptional()
  @ApiProperty({ required: false, default: 10 })
  limit: number;
}
