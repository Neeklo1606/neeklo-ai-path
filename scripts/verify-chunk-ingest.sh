#!/bin/bash
# Clear assistant KB, ingest short text, print stats (for chunking verification).
set -euo pipefail
PID=$(pm2 pid neeklo-api)
while IFS= read -r line; do
  case "$line" in
    JWT_SECRET=*) export JWT_SECRET="${line#JWT_SECRET=}" ;;
  esac
done < <(tr '\0' '\n' < "/proc/$PID/environ" | grep -aE '^JWT_SECRET=')
cd /var/www/neeklo.ru
AID=$(node --input-type=module <<'N'
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const a = await p.assistant.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } });
if (!a) throw new Error("no assistant");
console.log(a.id);
await p.$disconnect();
N
)
TOKEN=$(node scripts/gen-admin-jwt.mjs)
echo "CLEAR:"
curl -sS -X DELETE -H "Authorization: Bearer ${TOKEN}" "http://127.0.0.1:8787/assistants/${AID}/knowledge"
echo ""
echo "INGEST:"
curl -sS -X POST "http://127.0.0.1:8787/assistants/${AID}/knowledge/text" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"text":"Компания продаёт красные носки. Тест RAG."}'
echo ""
echo "STATS:"
curl -sS -H "Authorization: Bearer ${TOKEN}" "http://127.0.0.1:8787/assistants/${AID}/knowledge/stats"
echo ""
