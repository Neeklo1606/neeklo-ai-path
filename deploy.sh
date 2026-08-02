#!/bin/bash
set -e

echo "=== DEPLOY START $(date) ==="

cd /var/www/neeklo.ru

echo "=== GIT SYNC ==="
git fetch origin
git reset --hard origin/main

echo "=== INSTALL ==="
# Vite и Prisma CLI в devDependencies — при NODE_ENV=production обычный npm install их не ставит
npm install --include=dev

echo "=== BUILD FRONTEND ==="
# Атомарная замена dist: не удаляем текущий dist до готовности новой сборки (иначе при открытии сайта — 500/404)
STAGE="dist.build.$$"
rm -rf "$STAGE"
npm run build -- --outDir "$STAGE"
if [ ! -f "$STAGE/index.html" ]; then
  echo "ERROR: сборка не создала $STAGE/index.html"
  rm -rf "$STAGE"
  exit 1
fi
PREV="dist.prev.$$"
rm -rf "$PREV"
if [ -d dist ]; then
  mv dist "$PREV"
fi
mv "$STAGE" dist
rm -rf "$PREV"

echo "=== LOAD ENV ==="
set -a
[ -f .env ] && . ./.env
# .env.secrets contains DB credentials and secrets not tracked in git
[ -f .env.secrets ] && . ./.env.secrets
set +a

echo "=== PRISMA ==="
npx prisma generate
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi
if [[ "$DATABASE_URL" != *"neeklo_cms"* ]]; then
  echo "ERROR: DATABASE_URL does not look like production neeklo DB"
  exit 1
fi
BACKUP_DIR="/var/backups/neeklo.ru"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/neeklo_cms_predeploy_$(date +%F_%H-%M-%S).sql"
echo "Creating DB backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" -f "$BACKUP_FILE"
echo "Backup size:"
ls -lh "$BACKUP_FILE"
# Safe mode: if Prisma detects potential data loss, command fails (no --accept-data-loss flag).
npx prisma db push

echo "=== PM2 RESTART ==="
pm2 restart neeklo-api --update-env

echo "=== NGINX CHECK ==="
nginx -t

echo "=== DEPLOY SUCCESS $(date) ==="
