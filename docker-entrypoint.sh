#!/bin/sh
set -e

mkdir -p /config/homebooks
export DATABASE_URL="${DATABASE_URL:-file:///config/homebooks/homebooks.db}"

npx prisma migrate deploy
exec node_modules/.bin/next start -p "${PORT:-3000}"
