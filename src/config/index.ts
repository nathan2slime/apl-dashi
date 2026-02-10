export type AppConfig = {
  PORT: number;

  SESSION_KEY: string;
  SESSION_EXPIRES_IN: string;
  SESSION_COOKIE: string;

  CLIENT_URL: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;

  LOGTO_DOMAIN: string;

  DATABASE_URL: string;

  PAYMENT_PROVIDER_API_KEY: string;
  PAYMENT_PROVIDER_PUBLIC_KEY: string;

  S3_ENDPOINT: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
  S3_BUCKET: string;
  S3_REGION: string;
  S3_PUBLIC_URL: string;

  CI: string;
};

export default (): AppConfig => ({
  PORT: Number(process.env.PORT ?? '5400'),

  SESSION_KEY: String(process.env.SESSION_KEY),
  SESSION_EXPIRES_IN: process.env.SESSION_EXPIRES_IN ?? '1d',
  SESSION_COOKIE: process.env.SESSION_COOKIE ?? 'pulso',

  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',

  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: String(process.env.REDIS_PASSWORD),

  LOGTO_DOMAIN: String(process.env.LOGTO_DOMAIN),

  DATABASE_URL: String(process.env.DATABASE_URL),

  PAYMENT_PROVIDER_API_KEY: String(process.env.PAYMENT_PROVIDER_API_KEY),
  PAYMENT_PROVIDER_PUBLIC_KEY: String(process.env.PAYMENT_PROVIDER_PUBLIC_KEY),

  S3_ENDPOINT: process.env.S3_ENDPOINT ?? 'http://minio:9000',
  S3_ACCESS_KEY: String(process.env.S3_ACCESS_KEY),
  S3_SECRET_KEY: String(process.env.S3_SECRET_KEY),
  S3_BUCKET: process.env.S3_BUCKET ?? 'uploads',
  S3_REGION: process.env.S3_REGION ?? 'us-east-1',
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL ?? 'http://localhost:9000/uploads',

  CI: process.env.CI ?? 'false'
});
