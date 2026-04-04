#!/bin/bash
# Run on production as root from /var/www/neeklo.ru — sets neeklo_user password via postgres superuser,
# appends DATABASE_URL / JWT_SECRET / CMS_SERVER_PORT to .env if missing, restarts PM2, runs Prisma checks.
set -euo pipefail
ROOT="/var/www/neeklo.ru"
cd "$ROOT"

echo "=== Step 1: DB exists and reachable as postgres ==="
sudo -u postgres psql -d neeklo -c "SELECT 1 AS ok;"

echo "=== Step 2: Set new password for neeklo_user (server-side, not guessed) ==="
DBPASS="$(openssl rand -hex 24)"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE neeklo_user WITH LOGIN PASSWORD '${DBPASS}';"

echo "=== Step 3: Merge .env (append only if missing) ==="
if ! grep -q '^DATABASE_URL=' .env 2>/dev/null; then
  printf '\nDATABASE_URL=postgresql://neeklo_user:%s@localhost:5432/neeklo\n' "$DBPASS" >> .env
fi
if ! grep -q '^JWT_SECRET=' .env 2>/dev/null; then
  printf 'JWT_SECRET=%s\n' "$(openssl rand -hex 32)" >> .env
fi
if ! grep -q '^CMS_SERVER_PORT=' .env 2>/dev/null; then
  printf 'CMS_SERVER_PORT=8787\n' >> .env
fi

echo "=== Step 4: grep DATABASE_URL (masked) ==="
grep '^DATABASE_URL=' .env | sed -E 's|(postgresql://[^:]+:)[^@]+(@)|\1***MASKED***\2|'

echo "=== Step 5: PM2 restart ==="
pm2 delete neeklo-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "=== Step 6: Prisma ==="
set -a
# shellcheck disable=SC1091
. ./.env
set +a
npx prisma generate
npx prisma db push

echo "=== Step 7: /health ==="
curl -sS "http://127.0.0.1:8787/health" || true
echo ""

echo "=== Step 8: public CMS page (HTTP code + first line) ==="
curl -sS -o /tmp/cms_page.json -w "HTTP %{http_code}\n" "https://neeklo.ru/cms-api/pages/slug/home?locale=ru" || true
head -c 400 /tmp/cms_page.json 2>/dev/null || true
echo ""

echo "=== Step 9: login (no password in script — expect 401 if creds wrong) ==="
curl -sS -o /tmp/login.json -w "HTTP %{http_code}\n" -X POST "https://neeklo.ru/cms-api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dsc-23@yandex.ru","password":"invalid-placeholder"}' || true
cat /tmp/login.json 2>/dev/null || true
echo ""

echo "=== Step 10: pm2 logs (last 50) ==="
pm2 logs neeklo-api --lines 50 --nostream || true

echo "=== pm2 show neeklo-api (excerpt env) ==="
pm2 show neeklo-api 2>/dev/null | sed -n '1,120p' || true
