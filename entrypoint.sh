#!/bin/sh

set -e

pnpm run db:migrate:deploy
pnpm run start:prod
