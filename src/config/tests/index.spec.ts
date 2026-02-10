import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import config from '~/config';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default config values', () => {
    delete process.env.PORT;
    delete process.env.SESSION_KEY;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
    delete process.env.DATABASE_URL;
    delete process.env.SESSION_EXPIRES_IN;
    delete process.env.SESSION_COOKIE;
    delete process.env.CLIENT_URL;
    delete process.env.CI;
    delete process.env.PAYMENT_PROVIDER_API_KEY;
    delete process.env.PAYMENT_PROVIDER_PUBLIC_KEY;

    const appConfig = config();

    expect(appConfig.PORT).toBe(5400);
    expect(appConfig.REDIS_HOST).toBe('localhost');
    expect(appConfig.REDIS_PORT).toBe(6379);
    expect(appConfig.SESSION_EXPIRES_IN).toBe('1d');
    expect(appConfig.SESSION_COOKIE).toBe('pulso');
    expect(appConfig.CLIENT_URL).toBe('http://localhost:3000');
    expect(appConfig.CI).toBe('false');
  });

  it('should override defaults with environment variables', () => {
    process.env.PORT = '3000';
    process.env.SESSION_KEY = 'test-key';
    process.env.REDIS_HOST = 'redis.example.com';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'password123';
    process.env.DATABASE_URL = 'postgresql://localhost/db';
    process.env.SESSION_EXPIRES_IN = '7d';
    process.env.SESSION_COOKIE = 'auth';
    process.env.CLIENT_URL = 'http://example.com';
    process.env.CI = 'true';
    process.env.PAYMENT_PROVIDER_API_KEY = 'api-key';
    process.env.PAYMENT_PROVIDER_PUBLIC_KEY = 'public-key';

    const appConfig = config();

    expect(appConfig.PORT).toBe(3000);
    expect(appConfig.SESSION_KEY).toBe('test-key');
    expect(appConfig.REDIS_HOST).toBe('redis.example.com');
    expect(appConfig.REDIS_PORT).toBe(6380);
    expect(appConfig.REDIS_PASSWORD).toBe('password123');
    expect(appConfig.DATABASE_URL).toBe('postgresql://localhost/db');
    expect(appConfig.SESSION_EXPIRES_IN).toBe('7d');
    expect(appConfig.SESSION_COOKIE).toBe('auth');
    expect(appConfig.CLIENT_URL).toBe('http://example.com');
    expect(appConfig.CI).toBe('true');
    expect(appConfig.PAYMENT_PROVIDER_API_KEY).toBe('api-key');
    expect(appConfig.PAYMENT_PROVIDER_PUBLIC_KEY).toBe('public-key');
  });
});
