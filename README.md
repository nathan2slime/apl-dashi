# APL Dashi API

A NestJS backend for APL Dashi, providing cookie-based authentication, user lookup, threaded posts with file attachments, health checks, and local observability.

PostgreSQL is the source of truth through Prisma, Redis stores authenticated session data, and an S3-compatible object store keeps uploaded post assets. The local Docker Compose environment uses MinIO for object storage and Loki, Fluent Bit, and Grafana for log collection and visualization.

## Architecture

```mermaid
flowchart LR
    Client[Client / Web App]
    API[NestJS API]
    Postgres[(PostgreSQL)]
    Redis[(Redis)]
    Storage[(S3-compatible Storage / MinIO)]
    Docs[Swagger + Scalar]
    FluentBit[Fluent Bit]
    Loki[(Loki)]
    Grafana[Grafana]

    Client -->|HTTP / cookies| API
    API -->|Prisma reads and writes| Postgres
    API -->|Session data| Redis
    API -->|Post attachments| Storage
    API -->|OpenAPI document| Docs
    API -->|Container logs| FluentBit
    FluentBit --> Loki
    Grafana -->|Query logs| Loki
```

## Tech Stack

| Technology        | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| NestJS 11         | HTTP API and application modules                 |
| TypeScript        | Application language                             |
| Prisma 7          | PostgreSQL schema, migrations, and typed client  |
| PostgreSQL        | Primary database and source of truth             |
| Redis             | Session storage                                  |
| MinIO / S3        | S3-compatible post attachment storage            |
| Swagger + Scalar  | API documentation and OpenAPI reference          |
| Nest Terminus     | Health checks for memory, disk, and database     |
| Vitest            | Unit tests                                       |
| Biome             | Linting and formatting                           |
| Docker Compose    | Local infrastructure and container orchestration |
| Loki + Fluent Bit | Container log collection                         |
| Grafana           | Local log visualization                          |
| pnpm              | Package management                               |

## Repository Structure

```text
.
|-- src/
|   |-- app/
|   |   |-- asset/      # Uploaded asset metadata service
|   |   |-- auth/       # Signup, signin, signout, session guard and strategy
|   |   |-- database/   # Prisma and Redis services
|   |   |-- filters/    # Global HTTP exception filter
|   |   |-- health/     # Terminus health endpoint
|   |   |-- post/       # Post creation, pagination and thread retrieval
|   |   |-- upload/     # Upload service, provider factory and S3 provider
|   |   `-- user/       # User lookup endpoint and service
|   |
|   |-- config/         # Application and storage configuration
|   |-- generated/      # Generated Prisma client
|   |-- utils/          # Shared helpers and validators
|   `-- main.ts         # Nest bootstrap, CORS, Swagger and Scalar setup
|
|-- prisma/
|   `-- schema.prisma   # Database models, relations, enums and indexes
|
|-- metrics/            # Loki, Fluent Bit and Grafana provisioning
|-- Dockerfile          # Production container build
|-- docker-compose.yaml # API, database, cache, storage and observability stack
`-- entrypoint.sh       # Production startup script
```

| Path                                  | Responsibility                                      |
| ------------------------------------- | --------------------------------------------------- |
| [`src/app/auth`](src/app/auth)        | Cookie authentication, session validation and guard |
| [`src/app/post`](src/app/post)        | Post creation, attachment linking and thread reads  |
| [`src/app/upload`](src/app/upload)    | S3-compatible upload and deletion operations        |
| [`src/app/database`](src/app/database) | Prisma and Redis integration                       |
| [`src/app/health`](src/app/health)    | Runtime health checks                               |
| [`prisma/schema.prisma`](prisma/schema.prisma) | Database schema and relations                     |
| [`metrics/`](metrics)                 | Local logging and Grafana provisioning              |

## Requirements

Make sure the following tools are installed before running the project:

| Tool           | Version / Notes                                 |
| -------------- | ----------------------------------------------- |
| Node.js        | `22`                                            |
| pnpm           | `10.29.2`                                       |
| Docker         | Docker Engine or Docker Desktop                 |
| Docker Compose | Compose v2                                      |
| PostgreSQL     | Required for host-based local development       |
| Redis          | Required for host-based local development       |
| MinIO / S3     | Required for attachment uploads in development  |

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure the environment

Start from `.env.example`:

```sh
cp .env.example .env
cp .env.example .env.production
```

Use `.env` for host-based development and `.env.production` for Docker Compose.

When running with Docker Compose, containers should use Docker service hostnames instead of `localhost`. For example:

```env
DATABASE_URL="postgresql://postgres:root@postgres:5432/root?schema=public"
REDIS_HOST="redis"
S3_ENDPOINT="http://minio:9000"
S3_PUBLIC_URL="http://localhost:9000/uploads"
```

Set real values for secrets before starting the application:

```text
SESSION_KEY
REDIS_PASSWORD
MINIO_ROOT_PASSWORD
S3_SECRET_KEY
```

The most relevant application variables are:

| Variable | Purpose |
| -------- | ------- |
| `PORT` | API port, defaults to `5400` |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis session store connection |
| `SESSION_COOKIE`, `SESSION_EXPIRES_IN`, `SESSION_KEY` | Cookie and session configuration |
| `CLIENT_URL` | CORS allowed origin |
| `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_URL` | S3-compatible storage configuration |
| `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | Local MinIO credentials |

### 3. Generate Prisma client and run migrations

```sh
pnpm db:generate
pnpm db:migrate:dev
```

### 4. Start the API locally

```sh
pnpm start:dev
```

The API is served with the global `/api` prefix.

### 5. Run the full Docker Compose stack

```sh
docker compose --env-file .env.production up --build
```

The API container uses `entrypoint.sh` to run production migrations and then start the compiled server:

```sh
pnpm run db:migrate:deploy
pnpm run start:prod
```

## Local Development

For faster development cycles, run the supporting services with Docker and start the NestJS API directly on the host.

Start infrastructure:

```sh
docker compose --env-file .env.production up -d postgres redis minio minio-init
```

Generate the Prisma client and apply development migrations:

```sh
pnpm db:generate
pnpm db:migrate:dev
```

Start the API in watch mode:

```sh
pnpm start:dev
```

## Services

| Service       | URL                          |
| ------------- | ---------------------------- |
| API           | http://localhost:5400/api    |
| Swagger UI    | http://localhost:5400/api/docs |
| Scalar Reference | http://localhost:5400/api/reference |
| Health Check  | http://localhost:5400/api/health |
| PostgreSQL    | localhost:5432               |
| Redis         | localhost:6379               |
| MinIO API     | http://localhost:9000        |
| MinIO Console | http://localhost:9001        |
| Loki          | http://localhost:3100        |
| Grafana       | http://localhost:3001        |

Grafana uses `admin` / `admin` by default in the local Compose stack.

## Main Features

| Area | Capability |
| ---- | ---------- |
| Authentication | Signup, signin, signout, and authenticated session lookup |
| Sessions | HTTP-only cookie sessions backed by Redis |
| Users | Authenticated user lookup by ID |
| Posts | Authenticated post creation, pagination, item lookup and threaded replies |
| Attachments | Multipart uploads stored through the S3 provider and linked as assets |
| Health | Memory, RSS, disk and database health checks |
| Documentation | Swagger UI and Scalar API reference generated from the Nest application |
| Observability | Docker log forwarding through Fluent Bit into Loki, visualized with Grafana |

## Core Endpoints

Global API prefix: `/api`

| Area | Method | Path | Notes |
| ---- | ------ | ---- | ----- |
| Authentication | `POST` | `/api/auth/signup` | Creates a user and sets the auth cookie |
| Authentication | `POST` | `/api/auth/signin` | Authenticates a user and sets the auth cookie |
| Authentication | `POST` | `/api/auth/signout` | Requires an authenticated session |
| Authentication | `GET` | `/api/auth` | Returns the authenticated session |
| Users | `GET` | `/api/users/show/:userId` | Requires an authenticated session |
| Posts | `POST` | `/api/posts/create` | Requires authentication and accepts multipart `attachments[]` |
| Posts | `GET` | `/api/posts/paginate?cursor=<id>&limit=<n>` | Requires an authenticated session |
| Posts | `GET` | `/api/posts/item/:id` | Requires an authenticated session and returns item plus replies |
| Health | `GET` | `/api/health` | Runtime health check |

## Data Model

Prisma schema source: [`prisma/schema.prisma`](prisma/schema.prisma)

| Model | Responsibility |
| ----- | -------------- |
| `User` | Account identity with `email`, `username`, `password`, `emailVerified` and timestamps |
| `UserPreferences` | User profile preferences such as `theme` and `avatar` |
| `Post` | Main domain entity with content, tags, coordinates, status, author and optional parent post |
| `Asset` | Uploaded file metadata with URL, storage key, provider and optional post relation |

Relationships:

```text
User 1:N Post
User 1:N UserPreferences
Post 1:N Asset
Post 1:N Post replies through parentId
```

Enums:

| Enum | Values |
| ---- | ------ |
| `Status` | `SOLVED`, `IN_PROGRESS`, `PENDING` |
| `AssetProvider` | `LOCAL`, `AWS_S3`, `CLOUDINARY` |

Indexes and constraints:

| Target | Type |
| ------ | ---- |
| `User.email` | Unique constraint |
| `User.username` | Unique constraint |
| `Post.parentId` | Index for threaded reply queries |

## Post Upload Flow

Creating a post with attachments follows this flow:

```text
POST /api/posts/create
      |
      v
Upload each attachment to S3-compatible storage
      |
      v
Create the post in PostgreSQL through Prisma
      |
      v
Link uploaded assets to the created post
```

If post creation fails after one or more files were uploaded, the API attempts to delete the uploaded assets before returning the error response.

## Useful Commands

Start in development mode:

```sh
pnpm start:dev
```

Build the application:

```sh
pnpm build
```

Run the compiled server:

```sh
pnpm start:prod
```

Run tests:

```sh
pnpm test
```

Run test coverage:

```sh
pnpm test:cov
```

Run Biome checks:

```sh
pnpm lint
```

Format files:

```sh
pnpm format
```

Open Prisma Studio:

```sh
pnpm studio
```

Run development migrations:

```sh
pnpm db:migrate:dev
```

Run deploy migrations:

```sh
pnpm db:migrate:deploy
```

Regenerate the Prisma client:

```sh
pnpm db:generate
```

Start the full Docker stack:

```sh
docker compose --env-file .env.production up --build
```

Start the stack in the background:

```sh
docker compose --env-file .env.production up -d
```

Stop the stack:

```sh
docker compose --env-file .env.production down
```

View container logs:

```sh
docker compose --env-file .env.production logs -f
```

## Project Goals

This repository is primarily a backend API for experimenting with and supporting:

| Goal | Description |
| ---- | ----------- |
| Cookie sessions | HTTP-only authentication with Redis-backed session state |
| Threaded posts | Parent/child post modeling for replies and discussions |
| Attachment uploads | S3-compatible asset storage with database metadata |
| Prisma modeling | Typed PostgreSQL access and migrations with Prisma 7 |
| Local infrastructure | Reproducible PostgreSQL, Redis, MinIO and observability services through Docker Compose |
| API documentation | Runtime Swagger and Scalar references generated from the application |

The main architectural principle is simple:

> PostgreSQL owns the application data. Redis owns temporary session state. S3-compatible storage owns uploaded files.
