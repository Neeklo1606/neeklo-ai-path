#!/usr/bin/env bash
# Освободить :8787, перезапуск PM2 (BeGet)
set -euo pipefail
export PM2_HOME="${HOME}/.pm2"
cd /home/d/dsc23ytp/neeklo/public_html
pkill -f "server/cms-server.mjs" 2>/dev/null || true
pm2 delete neeklo-api 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2
if command -v fuser >/dev/null 2>&1; then fuser -k 8787/tcp 2>/dev/null || true; fi
sleep 1
pm2 start deploy/beget/ecosystem.config.cjs
sleep 5
curl -sS -o /dev/null -w "local:%{http_code}\n" "http://127.0.0.1:8787/pages/slug/home?locale=ru" || true
curl -sS -o /dev/null -w "apache:%{http_code}\n" -H "Host: neeklo.ru" "http://127.0.0.1/cms-api/pages/slug/home?locale=ru" || true
pm2 save
pm2 list
