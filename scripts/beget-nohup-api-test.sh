#!/usr/bin/env bash
set -euo pipefail
export PM2_HOME="${HOME}/.pm2"
pm2 kill 2>/dev/null || true
pkill -f "server/cms-server.mjs" 2>/dev/null || true
sleep 2
cd /home/d/dsc23ytp/neeklo/public_html
nohup node server/cms-server.mjs >/tmp/nohup-cms.log 2>&1 &
sleep 4
ss -tlnp 2>/dev/null | grep 8787 || true
curl -sS -o /dev/null -w "http:%{http_code}\n" "http://127.0.0.1:8787/pages/slug/home?locale=ru" || true
echo "--- log ---"
tail -5 /tmp/nohup-cms.log
