#!/usr/bin/env bash
set -euo pipefail
export PM2_HOME="${HOME}/.pm2"
pm2 kill 2>/dev/null || true
pkill -f "server/cms-server.mjs" 2>/dev/null || true
sleep 1
fuser -k 8787/tcp 2>/dev/null || true
sleep 1
cd /home/d/dsc23ytp/neeklo/public_html
nohup node server/cms-server.mjs >>/tmp/neeklo-api.log 2>&1 &
echo $! >/tmp/neeklo-api.pid
sleep 3
ss -tlnp | grep 8787 || true
curl -sS -o /dev/null -w "local:%{http_code}\n" "http://127.0.0.1:8787/pages/slug/home?locale=ru"
curl -sS -o /dev/null -w "apache:%{http_code}\n" -H "Host: neeklo.ru" "http://127.0.0.1/cms-api/pages/slug/home?locale=ru"
