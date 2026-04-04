#!/bin/bash
set -euo pipefail
cd /var/www/neeklo.ru
set -a
# shellcheck disable=SC1091
[ -f .env ] && . ./.env
set +a
PNG_B64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
printf '%s' "$PNG_B64" | base64 -d > /tmp/neeklo-test.png
TOKEN="$(node scripts/gen-admin-jwt.mjs)"
CODE=$(curl -sS -o /tmp/up.json -w "%{http_code}" -X POST "https://neeklo.ru/cms-api/media/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/neeklo-test.png" \
  -F "alt=smoke-test")
echo "upload HTTP:$CODE"
head -c 400 /tmp/up.json
echo ""
curl -sS -H "Authorization: Bearer ${TOKEN}" "https://neeklo.ru/cms-api/media" | head -c 600
echo ""
sudo -u postgres psql -d neeklo -c "SELECT COUNT(*) AS cms_media_rows FROM cms_media WHERE deleted_at IS NULL;"
ls -la /var/www/neeklo.ru/public/uploads | head -15
