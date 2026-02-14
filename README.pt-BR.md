# APL Dashi API

API backend construída com NestJS, Prisma, PostgreSQL, Redis e armazenamento de objetos compatível com S3 (MinIO no ambiente Docker local).

## Stack

- NestJS 11
- Prisma 7 + PostgreSQL
- Redis (armazenamento de sessão)
- Provedor de upload S3 (`@aws-sdk/client-s3`)
- Swagger + Scalar para documentação da API
- Stack Docker Compose com MinIO, Loki, Fluent Bit e Grafana

## Funcionalidades Principais

- Autenticação por cookie com sessões salvas no Redis
- Cadastro, login, logout e validação de sessão
- Criação de posts com anexos opcionais
- Paginação de posts e consulta de thread/respostas
- Busca de usuário por ID
- Endpoint de health check (memória, disco e banco)

## Estrutura do Projeto

- `src/app/auth`: módulo de autenticação, guard, strategy e service
- `src/app/user`: módulo de usuários e endpoints de consulta
- `src/app/post`: fluxos de post (criar, listar, item/thread)
- `src/app/upload`: serviço de upload e factory de provedores
- `src/app/database`: serviços de Prisma e Redis
- `src/app/health`: endpoint de health com Nest Terminus
- `prisma/schema.prisma`: modelos do banco
- `docker-compose.yaml`: infraestrutura local completa

## Modelagem do Banco de Dados

Fonte do schema Prisma: `prisma/schema.prisma`

Entidades principais:

- `User`: identidade da conta (`email`, `username`, `password`, `emailVerified`) e timestamps.
- `UserPreferences`: preferências de perfil (`theme`, `avatar`) vinculadas por `userId`.
- `Post`: entidade principal de domínio (`content`, `tags`, `latitude`, `longitude`, `status`) com suporte a respostas encadeadas via `parentId`.
- `Asset`: metadados de arquivos enviados (`url`, `key`, `provider`) com vínculo opcional ao post por `postId`.

Relacionamentos:

- `User` 1:N `Post` (`authorId`)
- `User` 1:N `UserPreferences` (`userId`)
- `Post` 1:N `Asset` (`postId`)
- Autorrelação em `Post` 1:N para respostas (`parentId` -> `id`)

Enums:

- `Status`: `SOLVED`, `IN_PROGRESS`, `PENDING`
- `AssetProvider`: `LOCAL`, `AWS_S3`, `CLOUDINARY`

Índices e restrições:

- Únicos: `User.email`, `User.username`
- Índice: `Post.parentId` (melhora consultas de threads/respostas)

## Variáveis de Ambiente

Comece a partir de `.env.example`.

```bash
cp .env.example .env
```

Variáveis mais importantes:

- `PORT`: porta da API (padrão `5400`)
- `DATABASE_URL`: string de conexão PostgreSQL
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `SESSION_COOKIE`, `SESSION_EXPIRES_IN`, `SESSION_KEY`
- `CLIENT_URL`: origem permitida no CORS
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_URL`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`

## Rodando Localmente (Node)

Pré-requisitos:

- Node.js 22+
- pnpm 10+
- PostgreSQL, Redis e MinIO disponíveis

Instalar dependências:

```bash
pnpm install
```

Gerar o client do Prisma e executar migrations:

```bash
pnpm db:generate
pnpm db:migrate:dev
```

Iniciar em modo desenvolvimento:

```bash
pnpm start:dev
```

## Rodando com Docker Compose

Build e subida da stack completa:

```bash
docker compose up --build
```

O container da API usa `entrypoint.sh` para executar:

1. `pnpm db:migrate:deploy`
2. `pnpm start:prod`

## Documentação da API

Com a API rodando:

- Swagger UI: `http://localhost:5400/api/docs`
- Scalar Reference: `http://localhost:5400/api/reference`

Prefixo global da API: `/api`

## Endpoints Principais

Autenticação:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout` (autenticado)
- `GET /api/auth` (sessão autenticada)

Usuários:

- `GET /api/users/show/:userId` (autenticado)

Posts:

- `POST /api/posts/create` (autenticado, multipart `attachments[]`)
- `GET /api/posts/paginate?cursor=<id>&limit=<n>`
- `GET /api/posts/item/:id`

Health:

- `GET /api/health`

## Scripts

- `pnpm start:dev`: inicia em modo watch
- `pnpm build`: gera build da aplicação
- `pnpm start:prod`: executa aplicação compilada
- `pnpm test`: executa testes (Vitest)
- `pnpm test:cov`: cobertura de testes
- `pnpm lint`: checagens do Biome
- `pnpm format`: formatação com Biome
- `pnpm db:migrate:dev`: migrations de desenvolvimento
- `pnpm db:migrate:deploy`: migrations para deploy
- `pnpm db:generate`: regenera Prisma client

## Observações

- A autenticação é baseada em cookie (`httpOnly`) e depende do Redis.
- O upload de arquivos atualmente usa a implementação de provedor S3.
- No Docker, o Grafana fica em `http://localhost:3001` (padrão `admin` / `admin`).
