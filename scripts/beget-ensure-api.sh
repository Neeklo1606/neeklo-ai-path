#!/usr/bin/env bash
set -uo pipefail
ROOT="/home/d/dsc23ytp/neeklo/public_html"
if curl -sf "http://127.0.0.1:8787/pages/slug/home?locale=ru" >/dev/null 2>&1; then
  exit 0
fi
pkill -f "server/cms-server.mjs" 2>/dev/null || true
sleep 1
fuser -k 8787/tcp 2>/dev/null || true
sleep 1
cd "$ROOT" || exit 1
nohup node server/cms-server.mjs >>/tmp/neeklo-api.log 2>&1 &
echo "$(date -Iseconds) restarted" >>/tmp/neeklo-api-restarts.log
