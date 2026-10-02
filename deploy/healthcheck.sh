#!/bin/bash
# Проверка живости neeklo-api. Запускается из cron раз в минуту:
#   * * * * * /var/www/neeklo.ru/deploy/healthcheck.sh >> /var/log/neeklo-healthcheck.log 2>&1
#
# Логика: две неудачи подряд → pm2 restart + уведомление в Telegram.
# О восстановлении тоже сообщает, чтобы было видно, чем закончилось.
set -uo pipefail

APP_DIR="${APP_DIR:-/var/www/neeklo.ru}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3001/health}"
STATE_FILE="${STATE_FILE:-/var/tmp/neeklo-healthcheck.state}"
LOCK_FILE="/var/tmp/neeklo-healthcheck.lock"
FAILS_BEFORE_RESTART="${FAILS_BEFORE_RESTART:-2}"
PM2_APP="${PM2_APP:-neeklo-api}"
export PATH="$PATH:/usr/local/bin:/usr/bin:/usr/local/lib/nodejs/bin"

# Не допускаем параллельных запусков (перезапуск занимает больше минуты).
# flock есть на сервере (Ubuntu); на машинах без него проверка просто идёт без блокировки.
if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE" || exit 0
  flock -n 9 || exit 0
fi

ts() { date "+%Y-%m-%d %H:%M:%S"; }

notify() {
  local text="$1"
  cd "$APP_DIR" 2>/dev/null || return 0
  local token
  token="$(grep -E '^TG_BOT_TOKEN=' .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"'"'"'[:space:]')"
  [ -z "$token" ] && return 0
  local db chats
  db="$(grep -E '^DATABASE_URL=' .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"')"
  chats="$(psql "$db" -Atc "select jsonb_array_elements_text(value) from cms_settings where key='tg.approved_chats'" 2>/dev/null)"
  [ -z "$chats" ] && return 0
  while read -r chat; do
    [ -z "$chat" ] && continue
    curl -s -m 15 -o /dev/null -X POST "https://api.telegram.org/bot${token}/sendMessage" \
      -H 'Content-Type: application/json' \
      -d "$(printf '{"chat_id":"%s","text":%s}' "$chat" "$(printf '%s' "$text" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')")"
  done <<< "$chats"
}

fails=0
[ -f "$STATE_FILE" ] && fails="$(cat "$STATE_FILE" 2>/dev/null || echo 0)"
[[ "$fails" =~ ^[0-9]+$ ]] || fails=0

if curl -fsS -m 10 "$HEALTH_URL" >/dev/null 2>&1; then
  if [ "$fails" -ge "$FAILS_BEFORE_RESTART" ]; then
    echo "$(ts) OK — API снова отвечает"
    notify "✅ neeklo-api снова отвечает ($(ts))"
  fi
  echo 0 > "$STATE_FILE"
  exit 0
fi

fails=$((fails + 1))
echo "$fails" > "$STATE_FILE"
echo "$(ts) НЕУДАЧА $fails: $HEALTH_URL не отвечает"

if [ "$fails" -eq "$FAILS_BEFORE_RESTART" ]; then
  echo "$(ts) перезапускаю $PM2_APP"
  restart_out="$(pm2 restart "$PM2_APP" --update-env 2>&1 | tail -3)"
  sleep 10
  if curl -fsS -m 10 "$HEALTH_URL" >/dev/null 2>&1; then
    echo "$(ts) перезапуск помог"
    notify "⚠️ neeklo-api не отвечал, перезапущен — сейчас работает ($(ts))"
    echo 0 > "$STATE_FILE"
  else
    echo "$(ts) перезапуск не помог"
    notify "🔴 neeklo-api не отвечает, перезапуск не помог ($(ts)). Нужен ручной разбор: pm2 logs $PM2_APP"$'\n'"$restart_out"
  fi
fi
exit 0
