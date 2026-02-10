import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '~/generated/prisma/client';

import { SignUpDto } from '~/app/auth/auth.dto';
import { PrismaService } from '~/app/database/prisma.service';
import { USER_NOT_FOUND_MESSAGE } from '~/config/errors';
import { exclude } from '~/utils/exclude';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(UserService.name);

  async getById(id: string) {
    this.logger.log(`Fetching user by ID: ${id}`);
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new HttpException(USER_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND);
    }

    this.logger.log(`User found with ID: ${id}`);
    return exclude<User, 'password'>(user, ['password']);
  }

  async create(data: SignUpDto) {
    this.logger.log(`Creating user with email: ${data.email}`);
    const user = await this.prisma.user.create({ data });
    this.logger.log(`User created with ID: ${user.id}`);

    return exclude<User, 'password'>(user, ['password']);
  }

  async getByEmail(email: string) {
    this.logger.log(`Fetching user by email: ${email}`);
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async getOnlyPassword(where: Prisma.UserWhereUniqueInput) {
    this.logger.log(
      `Fetching password for user with criteria: ${JSON.stringify(where)}`
    );

    return this.prisma.user.findUnique({ where, select: { password: true } });
  }
}
