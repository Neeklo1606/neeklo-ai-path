# Avito → Clero CRM Integration

**Date:** 2026-06-05  
**Status:** Approved  
**Scope:** `neeklo-ai-path/server/cms-server.mjs` + `AdminAvitoPage.tsx`

---

## Overview

При каждом входящем сообщении от клиента (не от владельца) в Avito — отправлять данные в Clero CRM через внутренний endpoint. Дедупликация по `chatid`: отправляется только один раз на чат. Кнопка в админке для ретроспективной синхронизации всех чатов.

---

## Constants

```
NIKITA_AVITO_AUTHOR_ID = "104436874"
CLERO_ENDPOINT         = "https://neeklo.ru/api/clero/avito-webhook"
CLERO_SENT_SETTING_KEY = "integrations.avito.clero_sent"
```

`CLERO_API_TOKEN` хранится в `.env` как `CLEROAPITOKEN` (не логировать, не коммитить).

---

## Webhook Payload Format (incoming from Avito)

```json
{
  "payload": {
    "type": "message",
    "value": {
      "id": "...",
      "chatid": "...",
      "content": { "text": "..." },
      "itemid": "...",
      "authorid": "...",
      "created": "...",
      "publishedat": "..."
    }
  }
}
```

---

## Clero Request Format (outgoing)

`POST https://neeklo.ru/api/clero/avito-webhook`

```json
{
  "chatid": "avito{chatid}",
  "clientname": "{val.authorid}",
  "message": "{text of first 1–3 client messages, joined with \\n---\\n}",
  "source": "avito",
  "timestamp": "{ISO 8601}"
}
```

No Authorization header (internal endpoint, auth handled server-side on Clero).  
`CLEROAPITOKEN` зарезервирован — добавить в env, использовать в будущем если потребуется.

---

## New Functions in `cms-server.mjs`

### `getCleroSentChats() → Promise<Record<string, true>>`
Читает `cms_settings[CLERO_SENT_SETTING_KEY]`, возвращает объект `{ chatId: true }`.

### `markCleroSent(chatId) → Promise<void>`
Добавляет `chatId: true` в `cms_settings[CLERO_SENT_SETTING_KEY]`.

### `sendToClero(chatId, authorId, messageText) → Promise<{ ok, status }>`
POST к `CLERO_ENDPOINT`. При ошибке — бросает исключение (caller логирует, не блокирует webhook).

### `isClientAvitoMessage(authorId) → boolean`
`String(authorId) !== NIKITA_AVITO_AUTHOR_ID`

---

## Webhook Handler Changes

В `handleAvitoIncomingWebhook`, сразу после текущего блока `ingestAvitoMessageToCrm`:

```
const val = payload?.payload?.value
if (val && val.chatid && isClientAvitoMessage(val.authorid)) {
  const sent = await getCleroSentChats()
  if (!sent[val.chatid]) {
    try {
      const text = String(val.content?.text || "").trim()
      await sendToClero(val.chatid, val.authorid, text)
      await markCleroSent(val.chatid)
      await writeAvitoLogLine(`clero sent chatid=${val.chatid}`)
    } catch (e) {
      await writeAvitoLogLine(`clero error chatid=${val.chatid}: ${e?.message}`)
      // не блокируем ответ вебхука
    }
  }
}
```

---

## New Endpoint: `POST /avito/clero/sync-all`

**Auth:** `requireAuth`

**Logic:**
1. Загрузить все события из `appendAvitoEventLog` (ключ `integrations.avito.events`)
2. Отфильтровать события с `eventType = "webhook_event"` и `payload.payload.type = "message"`
3. Сгруппировать по `chatid`, взять первые 3 сообщения клиентов (sorted by `created ASC`, `authorid !== NIKITA`)
4. Для каждого chatid которого нет в `clero_sent`:
   - Склеить тексты через `\n---\n`
   - Вызвать `sendToClero(chatid, authorid, text)` + `markCleroSent(chatid)`
5. Вернуть `{ sent: n, skipped: n, errors: [{ chatid, error }] }`

**Error handling:** ошибки одного чата не прерывают loop — накапливаются в `errors[]`.

---

## Frontend: AdminAvitoPage.tsx (`section === "chats"`)

Добавить в секцию `chats` после заголовка `<h2>Диалоги Avito</h2>`:

```tsx
<Button
  type="button"
  variant="outline"
  className={secondaryBtnClass}
  onClick={() => syncToCleroMutation.mutate()}
  disabled={syncToCleroMutation.isPending}
>
  {syncToCleroMutation.isPending ? "Синхронизация..." : "Отправить все в Clero"}
</Button>
```

`syncToCleroMutation` → `adminApi.post("/avito/clero/sync-all")` → тост с результатом `sent: n`.

---

## .env

```
CLEROAPITOKEN=<token>   # не коммитить, не логировать
```

Константа в коде: `const CLERO_API_TOKEN = process.env.CLEROAPITOKEN || ""`  
Используется только если потребуется auth на Clero endpoint в будущем.

---

## Error Handling Summary

| Scenario | Behaviour |
|---|---|
| Clero endpoint недоступен | Лог в `avito.log`, webhook возвращает `200 ok` |
| Уже отправленный chatid | Пропустить (check `clero_sent`) |
| Ошибка в sync-all на одном чате | Накопить в `errors[]`, продолжить loop |
| `val.content.text` пустой | Пропустить (не отправлять пустое в Clero) |

---

## Out of Scope

- Отправка исходящих сообщений от Никиты в Clero
- Обновление лида в Clero если пришли новые сообщения после первой отправки
- Retry queue при ошибках сети
