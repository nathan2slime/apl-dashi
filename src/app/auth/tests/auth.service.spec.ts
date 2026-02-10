import { HttpException, HttpStatus } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInDto, SignUpDto } from '~/app/auth/auth.dto';
import { AuthService } from '~/app/auth/auth.service';
import { Session } from '~/app/session/session.model';
import { SessionService } from '~/app/session/session.service';
import { UserService } from '~/app/user/user.service';
import {
  EMAIL_ALREADY_EXISTS_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE
} from '~/config/errors';
import { User } from '~/generated/prisma/client';

const compare = vi.fn();
const hash = vi.fn();

vi.mock('bcrypt', () => ({
  compare: (...args: string[]) => compare(...args),
  hash: (...args: string[]) => hash(...args)
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let sessionService: SessionService;

  const user: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false
  };

  beforeEach(() => {
    userService = {
      getByEmail: vi.fn(),
      create: vi.fn()
    } as unknown as UserService;

    sessionService = {
      create: vi.fn(),
      expire: vi.fn()
    } as unknown as SessionService;

    authService = new AuthService(userService, sessionService);
  });

  describe('signIn', () => {
    it('should throw if user does not exist', async () => {
      vi.mocked(userService.getByEmail).mockResolvedValue(null);
      const data: SignInDto = { email: 'test@example.com', password: 'pass' };

      await expect(authService.signIn(data)).rejects.toThrowError(
        new HttpException(INVALID_CREDENTIALS_MESSAGE, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw if password is invalid', async () => {
      vi.mocked(userService.getByEmail).mockResolvedValue(user);
      const data: SignInDto = { email: 'test@example.com', password: 'wrong' };

      await expect(authService.signIn(data)).rejects.toThrowError(
        new HttpException(INVALID_CREDENTIALS_MESSAGE, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should return a session if credentials are valid', async () => {
      const session: Session = {
        id: 's1',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(userService.getByEmail).mockResolvedValue(user);
      compare.mockResolvedValue(true);

      vi.mocked(sessionService.create).mockResolvedValue(session);

      const data: SignInDto = { email: 'test@example.com', password: 'pass' };
      const result = await authService.signIn(data);

      expect(result).toBe(session);
      expect(sessionService.create).toHaveBeenCalledWith(user);
    });
  });

  describe('signUp', () => {
    it('should throw if email already exists', async () => {
      vi.mocked(userService.getByEmail).mockResolvedValue(user);

      const data: SignUpDto = {
        email: 'test@example.com',
        password: 'pass',
        username: '',
        phone: ''
      };

      await expect(authService.signUp(data)).rejects.toThrowError(
        new HttpException(EMAIL_ALREADY_EXISTS_MESSAGE, HttpStatus.CONFLICT)
      );
    });

    it('should hash password, create user and return session', async () => {
      vi.mocked(userService.getByEmail).mockResolvedValue(null);

      const createdUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-pass'
      };
      const session: Session = {
        id: 's1',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(userService.create).mockResolvedValue(user);
      vi.mocked(sessionService.create).mockResolvedValue(session);

      const data: SignUpDto = {
        email: 'test@example.com',
        password: 'pass',
        username: '',
        phone: ''
      };

      hash.mockResolvedValue('hashed-pass');

      const result = await authService.signUp(data);

      expect(hash).toHaveBeenCalledWith('pass', 10);
      expect(userService.create).toHaveBeenCalledWith({
        ...data,
        password: 'hashed-pass'
      });
      expect(result).toBe(session);
    });
  });

  describe('signOut', () => {
    it('should call sessionService.expire', async () => {
      const session: Session = {
        id: 's1',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await authService.signOut(session);
      expect(sessionService.expire).toHaveBeenCalledWith('s1');
    });
  });
});
