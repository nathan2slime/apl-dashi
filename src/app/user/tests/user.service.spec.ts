import { HttpException, HttpStatus } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/app/user/user.service';
import { USER_NOT_FOUND_MESSAGE } from '~/config/errors';
import { User } from '~/generated/prisma/client';

describe('UserService', () => {
  let service: UserService;
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  };

  const user: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed',
    username: 'john',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false
  };

  beforeEach(() => {
    prisma.user.findUnique.mockReset();
    prisma.user.create.mockReset();
    service = new UserService(prisma as any);
  });

  it('should return user by id without password', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await service.getById('1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerified: false
    });
    expect((result as any).password).toBeUndefined();
  });

  it('should throw when user by id does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getById('missing')).rejects.toThrowError(
      new HttpException(USER_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND)
    );
  });

  it('should create user and remove password', async () => {
    prisma.user.create.mockResolvedValue(user);

    const payload = {
      email: user.email,
      password: '12345678',
      username: user.username,
      phone: ''
    };

    const result = await service.create(payload);

    expect(prisma.user.create).toHaveBeenCalledWith({ data: payload });
    expect((result as any).password).toBeUndefined();
  });

  it('should get user by email', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await service.getByEmail(user.email);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
    expect(result).toBe(user);
  });

  it('should get only password by where input', async () => {
    const password = { password: 'hashed' };
    prisma.user.findUnique.mockResolvedValue(password);

    const where = { id: '1' };
    const result = await service.getOnlyPassword(where);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where,
      select: { password: true }
    });
    expect(result).toBe(password);
  });
});
