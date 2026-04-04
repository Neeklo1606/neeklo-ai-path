#!/bin/bash
set -euo pipefail
cd /var/www/neeklo.ru
VAL="$(pm2 env 8 2>/dev/null | grep '^DATABASE_URL:' | sed 's/^DATABASE_URL:[[:space:]]*//')"
grep -v '^DATABASE_URL=' .env > .env.tmp
printf 'DATABASE_URL=%s\n' "$VAL" >> .env.tmp
mv .env.tmp .env
echo "deduped DATABASE_URL in .env"
