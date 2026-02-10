import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CookieAuthGuard } from '~/app/auth/auth.guard';

describe('JwtAuthGuard', () => {
  let guard: CookieAuthGuard;

  beforeEach(() => {
    guard = new CookieAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return the user when no error occurs', () => {
      const user: object = { id: '123', name: 'John' };
      const result = guard.handleRequest(null, user);

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user is not provided', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        UnauthorizedException
      );
    });

    it('should throw the provided error if present', () => {
      const error = new Error('Something went wrong');
      expect(() =>
        guard.handleRequest(error, { id: '1', name: 'Alice' })
      ).toThrow(error);
    });
  });

  describe('canActivate', () => {
    it('should call super.canActivate', () => {
      const context = {} as unknown as ExecutionContext;

      const superCanActivateSpy = vi.spyOn(
        CookieAuthGuard.prototype,
        'canActivate'
      );
      guard.canActivate(context);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
      superCanActivateSpy.mockRestore();
    });
  });
});
