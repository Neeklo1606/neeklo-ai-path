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
rm -rf dist
npm run build

echo "=== LOAD ENV ==="
set -a
[ -f .env ] && . ./.env
set +a

echo "=== PRISMA ==="
npx prisma generate
npx prisma db push

echo "=== PM2 RESTART ==="
pm2 restart neeklo-api --update-env

echo "=== NGINX CHECK ==="
nginx -t

echo "=== DEPLOY SUCCESS $(date) ==="
