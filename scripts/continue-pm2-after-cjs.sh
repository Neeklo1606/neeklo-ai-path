#!/bin/bash
set -euo pipefail
cd /var/www/neeklo.ru
rm -f ecosystem.config.js
pm2 start ecosystem.config.cjs
pm2 save
set -a
# shellcheck disable=SC1091
. ./.env
set +a
npx prisma generate
npx prisma db push
echo "=== HEALTH ==="
curl -sS "http://127.0.0.1:8787/health" || true
echo ""
echo "=== CMS page ==="
curl -sS -o /tmp/cms_page.json -w "HTTP %{http_code}\n" "https://neeklo.ru/cms-api/pages/slug/home?locale=ru" || true
head -c 600 /tmp/cms_page.json 2>/dev/null || true
echo ""
echo "=== Login (placeholder password — expect 401) ==="
curl -sS -o /tmp/login.json -w "HTTP %{http_code}\n" -X POST "https://neeklo.ru/cms-api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dsc-23@yandex.ru","password":"invalid-placeholder"}' || true
cat /tmp/login.json 2>/dev/null || true
echo ""
echo "=== pm2 logs ==="
pm2 logs neeklo-api --lines 50 --nostream || true
echo "=== pm2 show (full) ==="
pm2 show neeklo-api || true
echo "=== DATABASE_URL masked ==="
grep '^DATABASE_URL=' .env | sed -E 's|(postgresql://[^:]+:)[^@]+(@)|\1***MASKED***\2|'
