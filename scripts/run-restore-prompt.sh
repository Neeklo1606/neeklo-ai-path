#!/bin/bash
set -euo pipefail
PID=$(pm2 pid neeklo-api)
while IFS= read -r line; do
  case "$line" in
    DATABASE_URL=*) export DATABASE_URL="${line#DATABASE_URL=}" ;;
  esac
done < <(tr '\0' '\n' < "/proc/$PID/environ" | grep -a '^DATABASE_URL=')
cd /var/www/neeklo.ru
node scripts/restore-assistant-prompt.mjs
