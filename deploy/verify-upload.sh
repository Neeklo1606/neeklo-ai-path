#!/bin/bash
set -euo pipefail
mkdir -p /var/www/neeklo.ru/public/uploads
nginx -t
systemctl reload nginx
pm2 restart neeklo-api --update-env
sleep 5
TOKEN=$(curl -sS -X POST http://127.0.0.1:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dsc-23@yandex.ru","password":"123123123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "test413fix $(date -Iseconds)" > /tmp/upload-proof.txt
echo "--- curl local upload ---"
curl -sS -w "\nHTTP_CODE:%{http_code}\n" -X POST http://127.0.0.1:8787/media/upload \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/upload-proof.txt" \
  -F "alt=proof"
echo ""
echo "--- curl https upload ---"
curl -sS -w "\nHTTP_CODE:%{http_code}\n" -X POST https://neeklo.ru/cms-api/media/upload \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/upload-proof.txt" \
  -F "alt=proof2"
echo ""
echo "--- uploads dir (last 8) ---"
ls -la /var/www/neeklo.ru/public/uploads/ | tail -8
