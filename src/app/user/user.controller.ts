import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CookieAuthGuard } from '~/app/auth/auth.guard';
import { FindUserDto } from '~/app/user/user.dto';
import { UserService } from '~/app/user/user.service';

@Controller('users')
@ApiTags('Users')
@UseGuards(CookieAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UserController.name);

  @Get('show/:userId')
  async show(@Param() params: FindUserDto) {
    this.logger.log(`Fetching user with ID: ${params.userId}`);
    return this.userService.getById(params.userId);
  }
}
