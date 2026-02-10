import crypto from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { vi } from 'vitest';

import { CookieService } from '~/utils/cookie.service';

describe('CookieService', () => {
  let cookieService: CookieService;

  beforeEach(() => {
    const config = new ConfigService();
    config.set('SESSION_EXPIRES_IN', '1d');
    config.set('SESSION_COOKIE', 'auth');

    cookieService = new CookieService(config);
  });

  describe('auth', () => {
    it('should set cookie in response', async () => {
      const res = {
        cookie: () => {}
      } as unknown as Response;
      const sessionId = crypto.randomUUID();

      vi.spyOn(res, 'cookie');
      vi.mock('ms', () => 0);

      cookieService.auth(res, sessionId);

      expect(res.cookie).toHaveBeenCalledWith(
        'auth',
        sessionId,
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date)
        })
      );
    });
  });
});
