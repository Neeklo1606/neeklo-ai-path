#!/usr/bin/env bash
set -euo pipefail
export PM2_HOME="${HOME}/.pm2"
pkill -f "server/cms-server.mjs" 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2
cd /home/d/dsc23ytp/neeklo/public_html
pm2 start deploy/beget/ecosystem.config.cjs
sleep 6
curl -sS -o /dev/null -w "local:%{http_code}\n" "http://127.0.0.1:8787/pages/slug/home?locale=ru"
curl -sS -o /dev/null -w "apache:%{http_code}\n" -H "Host: neeklo.ru" "http://127.0.0.1/cms-api/pages/slug/home?locale=ru"
pm2 save
pm2 list
