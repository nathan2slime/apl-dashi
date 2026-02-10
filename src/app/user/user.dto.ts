import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import { IsCuid } from '~/utils/cuuid.validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @ApiProperty()
  password: string;

  @ApiProperty()
  username: string;

  @IsOptional()
  @ApiProperty()
  phone: string;
}

export class FindUserDto {
  @IsCuid()
  @ApiProperty()
  userId: string;
}
