#!/bin/bash
set -e

APP_DIR="${APP_DIR:-/var/www/neeklo.ru}"
cd "$APP_DIR"

# ─── Git sync + перезапуск свежей версии скрипта ───
# git reset меняет этот файл во время работы, а bash читает скрипт по ходу выполнения:
# без повторного exec выполнялась бы старая версия deploy.sh. Блок if…fi bash разбирает
# целиком до выполнения, поэтому подмена файла внутри него безопасна.
if [ "${DEPLOY_SYNCED:-}" != "1" ]; then
  echo "=== DEPLOY START $(date) ==="
  echo "=== GIT SYNC ==="
  git fetch origin
  git reset --hard origin/main
  echo "=== RE-EXEC deploy.sh @ $(git rev-parse --short HEAD) ==="
  DEPLOY_SYNCED=1 exec bash "$APP_DIR/deploy.sh" "$@"
fi

echo "=== INSTALL ==="
# Vite и Prisma CLI в devDependencies — при NODE_ENV=production обычный npm install их не ставит
npm install --include=dev

echo "=== BUILD FRONTEND ==="
# Сборка во временную папку; текущий dist не трогаем до успешного шага PRISMA
STAGE="dist.build.$$"
rm -rf "$STAGE"
trap 'rm -rf "$STAGE"' EXIT
npm run build -- --outDir "$STAGE"
if [ ! -f "$STAGE/index.html" ]; then
  echo "ERROR: сборка не создала $STAGE/index.html"
  exit 1
fi

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
BACKUP_DIR="${BACKUP_DIR:-/var/backups/neeklo.ru}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/neeklo_cms_predeploy_$(date +%F_%H-%M-%S).sql"
echo "Creating DB backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" -f "$BACKUP_FILE"
echo "Backup size:"
ls -lh "$BACKUP_FILE"
# Safe mode: if Prisma detects potential data loss, command fails (no --accept-data-loss flag).
npx prisma db push

echo "=== SWAP FRONTEND ==="
# Атомарная замена dist (иначе при открытии сайта — 500/404). Только после успешной БД,
# чтобы фронтенд и API не разъехались по версиям при сбое PRISMA.
PREV="dist.prev.$$"
rm -rf "$PREV"
if [ -d dist ]; then
  mv dist "$PREV"
fi
mv "$STAGE" dist
rm -rf "$PREV"

echo "=== PM2 RESTART ==="
pm2 restart neeklo-api --update-env

echo "=== NGINX CHECK ==="
nginx -t

echo "=== DEPLOY SUCCESS $(date) ==="
