#!/bin/bash
# Run ON main API server as root, from /var/www/neeklo.ru.
# Prisma needs DATABASE_URL + JWT_SECRET. If they exist only in PM2 (not in .env), run:
#   export $(tr '\0' '\n' < /proc/$(pm2 pid neeklo-api)/environ | grep -aE '^DATABASE_URL=' | xargs -I{} echo {})
#   export $(tr '\0' '\n' < /proc/$(pm2 pid neeklo-api)/environ | grep -aE '^JWT_SECRET=' | xargs -I{} echo {})
# then run the node snippets manually, or copy this file to the server and fix env loading.
set -euo pipefail
cd /var/www/neeklo.ru

load_pm2_db_env() {
  local pid line
  pid=$(pm2 pid neeklo-api)
  if [ -z "$pid" ] || [ ! -r "/proc/$pid/environ" ]; then
    echo "cannot read PM2 neeklo-api environ" >&2
    return 1
  fi
  while IFS= read -r line; do
    case "$line" in
      DATABASE_URL=*) export DATABASE_URL="${line#DATABASE_URL=}" ;;
      JWT_SECRET=*) export JWT_SECRET="${line#JWT_SECRET=}" ;;
    esac
  done < <(tr '\0' '\n' < "/proc/$pid/environ" | grep -aE '^DATABASE_URL=|^JWT_SECRET=')
}

load_pm2_db_env

echo "=== STEP 1: set system prompt (OK only) ==="
AID=$(cd /var/www/neeklo.ru && node --input-type=module <<'NODE'
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const a = await p.assistant.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } });
if (!a) throw new Error("no active assistant");
await p.assistant.update({
  where: { id: a.id },
  data: { systemPrompt: "Ты отвечаешь только словом ОК", temperature: 0 },
});
console.log(a.id);
await p.$disconnect();
NODE
)
echo "assistant_id=$AID"

CHAT1=$(curl -sS -X POST "http://127.0.0.1:8787/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"привет как дела"}]}')
echo "CHAT_REPLY_STEP1=$CHAT1"

echo ""
echo "=== STEP 3–5: ingest RAG + question ==="
TOKEN=$(node scripts/gen-admin-jwt.mjs)
curl -sS -X POST "http://127.0.0.1:8787/assistants/${AID}/knowledge/text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"text":"Компания продаёт красные носки"}' | tee /tmp/ingest.json
echo ""

STATS=$(curl -sS -H "Authorization: Bearer ${TOKEN}" "http://127.0.0.1:8787/assistants/${AID}/knowledge/stats")
echo "QDRANT_STATS=$STATS"

export AID
cd /var/www/neeklo.ru && node --input-type=module <<'NODE2'
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
await p.assistant.update({
  where: { id: process.env.AID },
  data: {
    systemPrompt: "Отвечай кратко по-русски, опираясь на CONTEXT если он есть.",
    temperature: 0.3,
  },
});
await p.$disconnect();
NODE2

CHAT2=$(curl -sS -X POST "http://127.0.0.1:8787/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"что вы продаете?"}]}')
echo "CHAT_REPLY_STEP3=$CHAT2"

echo ""
echo "=== PM2 logs (last 80 lines, grep RAG|FINAL) ==="
pm2 logs neeklo-api --lines 80 --nostream 2>&1 | grep -E 'FINAL PROMPT|RAG START|RAG CONTEXT|RAG CHUNKS|OLLAMA TIME' | tail -40 || true
