#!/bin/bash
cd /var/www/neeklo.ru

echo "=== GIT PULL ==="
git pull origin main

echo "=== INSTALL ==="
npm install

echo "=== BUILD FRONTEND ==="
npm run build

echo "=== PRISMA ==="
set -a
[ -f .env ] && . ./.env
set +a
npx prisma generate
npx prisma db push

echo "=== PM2 RESTART ==="
pm2 restart neeklo-api --update-env

echo "=== DONE ==="
