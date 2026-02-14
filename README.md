# APL Dashi API

Backend API built with NestJS, Prisma, PostgreSQL, Redis, and S3-compatible object storage (MinIO in local Docker setup).

## Stack

- NestJS 11
- Prisma 7 + PostgreSQL
- Redis (session storage)
- S3 upload provider (`@aws-sdk/client-s3`)
- Swagger + Scalar API docs
- Docker Compose stack with MinIO, Loki, Fluent Bit, and Grafana

## Main Features

- Cookie-based authentication with Redis-backed sessions
- User registration, login, logout, and session validation
- Post creation with optional file attachments
- Post pagination and thread/reply retrieval
- User lookup by ID
- Health check endpoint (memory, disk, database)

## Project Structure

- `src/app/auth`: authentication module, guards, strategy, service
- `src/app/user`: user module and user retrieval endpoints
- `src/app/post`: post CRUD-like flows (create, list, item/thread)
- `src/app/upload`: upload service and provider factory
- `src/app/database`: Prisma and Redis services
- `src/app/health`: health endpoint with Nest Terminus
- `prisma/schema.prisma`: database models
- `docker-compose.yaml`: full local infrastructure

## Database Modeling

Prisma schema source: `prisma/schema.prisma`

Main entities:

- `User`: account identity (`email`, `username`, `password`, `emailVerified`) and timestamps.
- `UserPreferences`: user profile preferences (`theme`, `avatar`) linked by `userId`.
- `Post`: main domain entity (`content`, `tags`, `latitude`, `longitude`, `status`) with optional threaded replies using `parentId`.
- `Asset`: uploaded file metadata (`url`, `key`, `provider`) optionally linked to a post via `postId`.

Relationships:

- `User` 1:N `Post` (`authorId`)
- `User` 1:N `UserPreferences` (`userId`)
- `Post` 1:N `Asset` (`postId`)
- `Post` self-reference 1:N for replies (`parentId` -> `id`)

Enums:

- `Status`: `SOLVED`, `IN_PROGRESS`, `PENDING`
- `AssetProvider`: `LOCAL`, `AWS_S3`, `CLOUDINARY`

Indexes and constraints:

- Unique: `User.email`, `User.username`
- Index: `Post.parentId` (improves threaded/reply queries)

## Environment Variables

Start from `.env.example`.

```bash
cp .env.example .env
```

The most relevant variables:

- `PORT`: API port (default `5400`)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `SESSION_COOKIE`, `SESSION_EXPIRES_IN`, `SESSION_KEY`
- `CLIENT_URL`: CORS allowed origin
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_URL`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`

## Running Locally (Node)

Prerequisites:

- Node.js 22+
- pnpm 10+
- PostgreSQL, Redis, and MinIO available

Install dependencies:

```bash
pnpm install
```

Generate Prisma client and run migrations:

```bash
pnpm db:generate
pnpm db:migrate:dev
```

Start in development mode:

```bash
pnpm start:dev
```

## Running with Docker Compose

Build and run the full stack:

```bash
docker compose up --build
```

API container uses `entrypoint.sh` to run:

1. `pnpm db:migrate:deploy`
2. `pnpm start:prod`

## API Documentation

With the API running:

- Swagger UI: `http://localhost:5400/api/docs`
- Scalar Reference: `http://localhost:5400/api/reference`

Global API prefix: `/api`

## Core Endpoints

Authentication:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout` (authenticated)
- `GET /api/auth` (authenticated session)

Users:

- `GET /api/users/show/:userId` (authenticated)

Posts:

- `POST /api/posts/create` (authenticated, multipart `attachments[]`)
- `GET /api/posts/paginate?cursor=<id>&limit=<n>`
- `GET /api/posts/item/:id`

Health:

- `GET /api/health`

## Scripts

- `pnpm start:dev`: start in watch mode
- `pnpm build`: build app
- `pnpm start:prod`: run compiled app
- `pnpm test`: run tests (Vitest)
- `pnpm test:cov`: test coverage
- `pnpm lint`: Biome checks
- `pnpm format`: Biome formatter
- `pnpm db:migrate:dev`: dev migrations
- `pnpm db:migrate:deploy`: deploy migrations
- `pnpm db:generate`: regenerate Prisma client

## Notes

- Authentication is cookie-based (`httpOnly`) and requires Redis.
- File upload currently uses the S3 provider implementation.
- In Docker, Grafana is exposed on `http://localhost:3001` (`admin` / `admin` by default).
