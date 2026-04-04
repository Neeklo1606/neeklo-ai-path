#!/bin/bash
set -euo pipefail
sleep 2
TOKEN=$(curl -sS -X POST http://127.0.0.1:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dsc-23@yandex.ru","password":"123123123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "proof $(date -Iseconds)" > /tmp/upload-proof.txt
echo "--- local POST /media/upload ---"
curl -sS -w "\nHTTP_CODE:%{http_code}\n" -X POST http://127.0.0.1:8787/media/upload \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/upload-proof.txt" \
  -F "alt=proof-local"
echo ""
echo "--- HTTPS POST /cms-api/media/upload ---"
curl -sS -w "\nHTTP_CODE:%{http_code}\n" -X POST https://neeklo.ru/cms-api/media/upload \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/upload-proof.txt" \
  -F "alt=proof-https"
echo ""
echo "--- disk ---"
ls -la /var/www/neeklo.ru/public/uploads/ | tail -6
