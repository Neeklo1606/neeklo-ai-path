#!/bin/bash
set -euo pipefail
cd /var/www/neeklo.ru
if grep -q '^DATABASE_URL=' .env 2>/dev/null; then
  echo "DATABASE_URL already in .env"
  exit 0
fi
VAL="$(pm2 env 8 2>/dev/null | grep '^DATABASE_URL:' | sed 's/^DATABASE_URL:[[:space:]]*//')"
printf '\nDATABASE_URL=%s\n' "$VAL" >> .env
echo "Appended DATABASE_URL to .env"
