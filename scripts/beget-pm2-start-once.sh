#!/usr/bin/env bash
# Single SSH session: start API, verify, save PM2 list (BeGet)
set -euo pipefail
export PM2_HOME="${PM2_HOME:-$HOME/.pm2}"
cd /home/d/dsc23ytp/neeklo/public_html
pm2 kill 2>/dev/null || true
pm2 start deploy/beget/ecosystem.config.cjs
sleep 5
echo "=== local 8787 ==="
curl -sS -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:8787/pages/slug/home?locale=ru" || true
echo "=== apache proxy (same host) ==="
curl -sS -o /dev/null -w "%{http_code}\n" -H "Host: neeklo.ru" "http://127.0.0.1/cms-api/pages/slug/home?locale=ru" || true
pm2 save
pm2 list
