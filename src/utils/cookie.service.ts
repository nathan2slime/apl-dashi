import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { AppConfig } from '~/config';

/**
 * Service responsible for setting authentication cookies on HTTP responses.
 *
 * Reads cookie configuration from the application's ConfigService and applies
 * standard security attributes when creating the cookie.
 */
@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  /**
   * Attach an authentication cookie to the provided HTTP response.
   *
   * @param res - Express Response object to which the cookie will be attached.
   * @param sessionId - Session identifier to store in the cookie.
   *
   * @remarks
   * - The cookie name is taken from config('SESSION_COOKIE').
   * - The cookie is marked httpOnly and its expiration is computed as:
   *   new Date(Date.now() + ms(config('SESSION_EXPIRES_IN'))).
   * - This method mutates the provided response by calling res.cookie(...).
   *
   * @throws Will throw or propagate an error if the expected configuration values are missing
   *         or if the 'ms' package fails to parse the SESSION_EXPIRES_IN value.
   *
   * @returns void
   */
  auth(res: Response, sessionId: string) {
    res.cookie(String(this.config.get('SESSION_COOKIE')), sessionId, {
      httpOnly: true,
      expires: new Date(
        Date.now() + require('ms')(this.config.get('SESSION_EXPIRES_IN'))
      )
    });
  }
}
