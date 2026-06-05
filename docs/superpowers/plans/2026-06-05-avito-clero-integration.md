# Avito → Clero CRM Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** При каждом входящем сообщении от клиента в Avito — автоматически отправлять данные в Clero CRM (с дедупликацией по chatid); плюс кнопка массовой синхронизации в админке.

**Architecture:** Вся логика добавляется в `server/cms-server.mjs` (следуя существующему паттерну). Флаг отправки хранится в `cms_settings` под ключом `integrations.avito.clero_sent`. Чистые функции (`isClientAvitoMessage`, `buildCleroPayload`) тестируются через Vitest.

**Tech Stack:** Node.js/Express, Prisma (PostgreSQL), React + TanStack Query, Vitest

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `server/cms-server.mjs` | Константы, 5 новых функций, изменение webhook handler, новый endpoint |
| Modify | `src/pages/admin/AdminAvitoPage.tsx` | Мутация + кнопка «Отправить все в Clero» |
| Modify | `.env` (на сервере) | Добавить `CLEROAPITOKEN=…` |
| Create | `src/lib/clero-integration.server.test.ts` | Vitest unit-тесты для чистых функций |

---

### Task 1: Constants and env var

**Files:**
- Modify: `server/cms-server.mjs` (после строки 510, блок AVITO_*_SETTING_KEY)
- Modify: `.env`

- [ ] **Step 1: Add env var to .env**

В файл `.env` в корне `neeklo-ai-path/` добавить строку:
```
CLEROAPITOKEN=src7XE3WlA9Yw4Cs376IfHM1YyPP2fkhwPf
```
⚠️ Убедись, что `.env` в `.gitignore` — не коммитить токен.

- [ ] **Step 2: Add constants in cms-server.mjs**

Найти блок со строки 508 (`const AVITO_CONFIG_SETTING_KEY`) и добавить после него:

```js
const CLERO_SENT_SETTING_KEY = "integrations.avito.clero_sent";
const CLERO_ENDPOINT = "https://neeklo.ru/api/clero/avito-webhook";
const NIKITA_AVITO_AUTHOR_ID = "104436874";
```

- [ ] **Step 3: Commit**

```bash
git add server/cms-server.mjs
git commit -m "feat(clero): add Clero integration constants"
```

---

### Task 2: Pure helper functions + unit tests

**Files:**
- Modify: `server/cms-server.mjs`
- Create: `src/lib/clero-integration.server.test.ts`

- [ ] **Step 1: Write failing tests**

Создать файл `src/lib/clero-integration.server.test.ts`:

```ts
import { describe, it, expect } from "vitest";

// Импортируем будущий модуль через dynamic import (он в .mjs)
// Тесты проверяют логику без зависимостей от Prisma/fetch.

describe("isClientAvitoMessage", () => {
  it("returns false for Nikita's authorId", async () => {
    const { isClientAvitoMessage } = await import("../../server/clero-helpers.mjs");
    expect(isClientAvitoMessage("104436874")).toBe(false);
  });

  it("returns true for any other authorId", async () => {
    const { isClientAvitoMessage } = await import("../../server/clero-helpers.mjs");
    expect(isClientAvitoMessage("999999")).toBe(true);
    expect(isClientAvitoMessage(12345)).toBe(true);
  });
});

describe("buildCleroPayload", () => {
  it("builds correct payload shape", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Привет, хочу купить");
    expect(p.chatid).toBe("avitoabc123");
    expect(p.clientname).toBe("999999");
    expect(p.message).toBe("Привет, хочу купить");
    expect(p.source).toBe("avito");
    expect(typeof p.timestamp).toBe("string");
    // ISO 8601 check
    expect(() => new Date(p.timestamp).toISOString()).not.toThrow();
  });

  it("trims and joins multiple messages", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Сообщение 1\n---\nСообщение 2");
    expect(p.message).toContain("---");
  });
});
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
cd neeklo-ai-path && npm test -- clero-integration.server.test
```

Expected: FAIL — `Cannot find module '../../server/clero-helpers.mjs'`

- [ ] **Step 3: Create server/clero-helpers.mjs**

Создать новый файл `server/clero-helpers.mjs`:

```js
/** Pure helper functions for Clero CRM integration. No Prisma/fetch deps. */

export const NIKITA_AVITO_AUTHOR_ID = "104436874";
export const CLERO_ENDPOINT = "https://neeklo.ru/api/clero/avito-webhook";
export const CLERO_SENT_SETTING_KEY = "integrations.avito.clero_sent";

/**
 * Returns true if the message is from a client (not Nikita).
 */
export function isClientAvitoMessage(authorId) {
  return String(authorId) !== NIKITA_AVITO_AUTHOR_ID;
}

/**
 * Builds the JSON payload to POST to Clero.
 * @param {string} chatId - Avito chatid
 * @param {string} authorId - Avito authorid of the first client
 * @param {string} messageText - Text (may be multiple messages joined with \n---\n)
 */
export function buildCleroPayload(chatId, authorId, messageText) {
  return {
    chatid: `avito${chatId}`,
    clientname: String(authorId),
    message: messageText,
    source: "avito",
    timestamp: new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Update cms-server.mjs to import from clero-helpers**

Удалить три константы, добавленные в Task 1, и вместо них добавить импорт вверху файла (рядом с другими imports):

```js
import {
  NIKITA_AVITO_AUTHOR_ID,
  CLERO_ENDPOINT,
  CLERO_SENT_SETTING_KEY,
  isClientAvitoMessage,
  buildCleroPayload,
} from "./clero-helpers.mjs";
```

- [ ] **Step 5: Run tests — verify they PASS**

```bash
cd neeklo-ai-path && npm test -- clero-integration.server.test
```

Expected: PASS (2 describe blocks, 4 tests)

- [ ] **Step 6: Commit**

```bash
git add server/clero-helpers.mjs src/lib/clero-integration.server.test.ts server/cms-server.mjs
git commit -m "feat(clero): add pure helper functions with tests"
```

---

### Task 3: Clero DB functions (getCleroSentChats / markCleroSent)

**Files:**
- Modify: `server/cms-server.mjs` (после функции `saveAvitoChatMap`, ~строка 588)

- [ ] **Step 1: Add functions in cms-server.mjs**

После функции `saveAvitoChatMap` (строка ~588) добавить:

```js
async function getCleroSentChats() {
  const val = await readJsonSetting(CLERO_SENT_SETTING_KEY, {});
  return typeof val === "object" && val !== null && !Array.isArray(val) ? val : {};
}

async function markCleroSent(chatId) {
  const current = await getCleroSentChats();
  current[String(chatId)] = true;
  await writeJsonSetting(CLERO_SENT_SETTING_KEY, current);
}
```

- [ ] **Step 2: Verify server starts without errors**

```bash
cd neeklo-ai-path && node --check server/cms-server.mjs
```

Expected: no output (syntax OK)

- [ ] **Step 3: Commit**

```bash
git add server/cms-server.mjs
git commit -m "feat(clero): add getCleroSentChats and markCleroSent"
```

---

### Task 4: sendToClero function

**Files:**
- Modify: `server/cms-server.mjs` (после `markCleroSent`)
- Modify: `src/lib/clero-integration.server.test.ts` (добавить тест с mock fetch)

- [ ] **Step 1: Write failing test for sendToClero**

Добавить в конец `src/lib/clero-integration.server.test.ts`:

```ts
import { vi } from "vitest";

describe("sendToClero", () => {
  it("POSTs correct payload and returns ok on 200", async () => {
    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    // cms-server.mjs не экспортирует sendToClero, поэтому тестируем через clero-helpers (после Task 4)
    const { sendToCleroRaw } = await import("../../server/clero-helpers.mjs?v=2");
    const result = await sendToCleroRaw("chat1", "999", "Хочу купить", mockFetch);
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://neeklo.ru/api/clero/avito-webhook");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.chatid).toBe("avitochat1");
    expect(body.source).toBe("avito");

    vi.unstubAllGlobals();
  });

  it("throws on non-200 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal("fetch", mockFetch);
    const { sendToCleroRaw } = await import("../../server/clero-helpers.mjs?v=3");
    await expect(sendToCleroRaw("c", "a", "t", mockFetch)).rejects.toThrow("Clero 503");
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
cd neeklo-ai-path && npm test -- clero-integration.server.test
```

Expected: FAIL — `sendToCleroRaw is not a function`

- [ ] **Step 3: Add sendToCleroRaw to clero-helpers.mjs**

Добавить в конец `server/clero-helpers.mjs`:

```js
/**
 * Testable core of sendToClero — accepts fetchFn to allow mocking.
 * @param {string} chatId
 * @param {string} authorId
 * @param {string} messageText
 * @param {Function} fetchFn - injected fetch (default: global fetch)
 */
export async function sendToCleroRaw(chatId, authorId, messageText, fetchFn = fetch) {
  const payload = buildCleroPayload(chatId, authorId, messageText);
  const resp = await fetchFn(CLERO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`Clero ${resp.status}`);
  return { ok: true, status: resp.status };
}
```

- [ ] **Step 4: Add sendToClero wrapper in cms-server.mjs**

После `markCleroSent` добавить:

```js
async function sendToClero(chatId, authorId, messageText) {
  return sendToCleroRaw(chatId, authorId, messageText);
}
```

Также обновить импорт из `clero-helpers.mjs` — добавить `sendToCleroRaw`:

```js
import {
  NIKITA_AVITO_AUTHOR_ID,
  CLERO_ENDPOINT,
  CLERO_SENT_SETTING_KEY,
  isClientAvitoMessage,
  buildCleroPayload,
  sendToCleroRaw,
} from "./clero-helpers.mjs";
```

- [ ] **Step 5: Run tests — verify they PASS**

```bash
cd neeklo-ai-path && npm test -- clero-integration.server.test
```

Expected: PASS (все тесты зелёные)

- [ ] **Step 6: Syntax check**

```bash
cd neeklo-ai-path && node --check server/cms-server.mjs && node --check server/clero-helpers.mjs
```

Expected: no output

- [ ] **Step 7: Commit**

```bash
git add server/clero-helpers.mjs server/cms-server.mjs src/lib/clero-integration.server.test.ts
git commit -m "feat(clero): add sendToClero with unit tests"
```

---

### Task 5: Modify webhook handler to send to Clero

**Files:**
- Modify: `server/cms-server.mjs` — функция `handleAvitoIncomingWebhook` (строка ~3479)

- [ ] **Step 1: Locate the exact insertion point**

Открыть `server/cms-server.mjs`, найти строку:
```js
await appendAvitoEventLog("webhook_event", payload, { agentId, mapped });
```
Это строка ~3505. Вставить блок ПЕРЕД этой строкой.

- [ ] **Step 2: Add Clero sending block**

```js
    // Send first client message per chat to Clero CRM
    const avitoVal = payload?.payload?.value;
    if (avitoVal && avitoVal.chatid && isClientAvitoMessage(avitoVal.authorid)) {
      const text = String(avitoVal.content?.text || "").trim();
      if (text) {
        try {
          const cleroSent = await getCleroSentChats();
          if (!cleroSent[String(avitoVal.chatid)]) {
            await sendToClero(String(avitoVal.chatid), String(avitoVal.authorid), text);
            await markCleroSent(String(avitoVal.chatid));
            await writeAvitoLogLine(`clero sent chatid=${avitoVal.chatid}`);
          }
        } catch (cleroErr) {
          await writeAvitoLogLine(`clero error chatid=${avitoVal.chatid}: ${cleroErr?.message}`);
        }
      }
    }
```

Результирующий конец функции выглядит так:

```js
    // ... (existing mapped/ingestAvitoMessageToCrm code above)

    // Send first client message per chat to Clero CRM
    const avitoVal = payload?.payload?.value;
    if (avitoVal && avitoVal.chatid && isClientAvitoMessage(avitoVal.authorid)) {
      const text = String(avitoVal.content?.text || "").trim();
      if (text) {
        try {
          const cleroSent = await getCleroSentChats();
          if (!cleroSent[String(avitoVal.chatid)]) {
            await sendToClero(String(avitoVal.chatid), String(avitoVal.authorid), text);
            await markCleroSent(String(avitoVal.chatid));
            await writeAvitoLogLine(`clero sent chatid=${avitoVal.chatid}`);
          }
        } catch (cleroErr) {
          await writeAvitoLogLine(`clero error chatid=${avitoVal.chatid}: ${cleroErr?.message}`);
        }
      }
    }

    await appendAvitoEventLog("webhook_event", payload, { agentId, mapped });
    await writeAvitoLogLine(`webhook ok agent=${agentId} message=${msg ? "yes" : "no"}`);
    return res.json({ ok: true, mapped });
```

- [ ] **Step 3: Syntax check**

```bash
cd neeklo-ai-path && node --check server/cms-server.mjs
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add server/cms-server.mjs
git commit -m "feat(clero): forward first client webhook message to Clero"
```

---

### Task 6: Bulk sync endpoint POST /avito/clero/sync-all

**Files:**
- Modify: `server/cms-server.mjs` — добавить endpoint после `app.post("/avito/sync", ...)` (~строка 3433)

- [ ] **Step 1: Add endpoint**

Найти строку `app.post("/avito/sync", requireAuth, async (req, res) => {` (~3433) и добавить ПОСЛЕ её закрывающего `});` новый endpoint:

```js
app.post("/avito/clero/sync-all", requireAuth, async (_req, res) => {
  try {
    const listRaw = await readJsonSetting(AVITO_EVENTS_SETTING_KEY, []);
    const list = Array.isArray(listRaw) ? listRaw : [];

    // Collect webhook_event entries with payload.payload.type === "message"
    const clientMsgs = list
      .filter(
        (ev) =>
          ev.eventType === "webhook_event" &&
          ev.payload?.payload?.type === "message" &&
          ev.payload?.payload?.value?.chatid &&
          isClientAvitoMessage(ev.payload?.payload?.value?.authorid)
      )
      .map((ev) => ({
        chatid: String(ev.payload.payload.value.chatid),
        authorid: String(ev.payload.payload.value.authorid),
        text: String(ev.payload.payload.value.content?.text || "").trim(),
        created: ev.payload.payload.value.created || ev.at || "",
      }))
      .filter((m) => m.text);

    // Group by chatid, sort by created ASC, take first 3
    const byChat = {};
    for (const m of clientMsgs) {
      if (!byChat[m.chatid]) byChat[m.chatid] = [];
      byChat[m.chatid].push(m);
    }
    for (const chatid of Object.keys(byChat)) {
      byChat[chatid].sort((a, b) => String(a.created).localeCompare(String(b.created)));
      byChat[chatid] = byChat[chatid].slice(0, 3);
    }

    const cleroSent = await getCleroSentChats();
    let sent = 0;
    let skipped = 0;
    const errors = [];

    for (const [chatid, msgs] of Object.entries(byChat)) {
      if (cleroSent[chatid]) {
        skipped++;
        continue;
      }
      const text = msgs.map((m) => m.text).join("\n---\n");
      const authorid = msgs[0].authorid;
      try {
        await sendToClero(chatid, authorid, text);
        await markCleroSent(chatid);
        await writeAvitoLogLine(`clero sync-all sent chatid=${chatid}`);
        sent++;
      } catch (e) {
        errors.push({ chatid, error: e?.message || "unknown" });
        await writeAvitoLogLine(`clero sync-all error chatid=${chatid}: ${e?.message}`);
      }
    }

    return res.json({ ok: true, sent, skipped, errors });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed" });
  }
});
```

- [ ] **Step 2: Syntax check**

```bash
cd neeklo-ai-path && node --check server/cms-server.mjs
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add server/cms-server.mjs
git commit -m "feat(clero): add POST /avito/clero/sync-all endpoint"
```

---

### Task 7: Frontend — кнопка «Отправить все в Clero»

**Files:**
- Modify: `src/pages/admin/AdminAvitoPage.tsx`

- [ ] **Step 1: Add mutation**

В `AdminAvitoPage.tsx`, после блока `const sendReply = useMutation({...})` (~строка 219) добавить новую мутацию:

```tsx
  const syncToCleroMutation = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post<{ sent: number; skipped: number; errors: { chatid: string; error: string }[] }>(
        "/avito/clero/sync-all",
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Clero: отправлено ${data.sent}, пропущено ${data.skipped}${data.errors.length ? `, ошибок: ${data.errors.length}` : ""}`);
    },
    onError: (error) => {
      toast.error(`Ошибка синхронизации с Clero: ${err(error)}`);
    },
  });
```

- [ ] **Step 2: Add button in chats section**

В секции `{activeSection === "chats" && (` найти заголовок `<h2 className="font-heading text-lg font-bold">Диалоги Avito</h2>` (~строка 499).

Заменить его на:

```tsx
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Диалоги Avito</h2>
            <Button
              type="button"
              variant="outline"
              className={secondaryBtnClass}
              onClick={() => syncToCleroMutation.mutate()}
              disabled={syncToCleroMutation.isPending}
            >
              {syncToCleroMutation.isPending ? "Синхронизация..." : "Отправить все в Clero"}
            </Button>
          </div>
```

- [ ] **Step 3: TypeScript check**

```bash
cd neeklo-ai-path && npx tsc --noEmit
```

Expected: no errors (или только pre-existing errors — зафиксировать их количество до изменения)

- [ ] **Step 4: Build**

```bash
cd neeklo-ai-path && npm run build
```

Expected: Build succeeded

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminAvitoPage.tsx
git commit -m "feat(clero): add 'Отправить все в Clero' button in admin chats"
```

---

### Task 8: Deploy and verify

- [ ] **Step 1: Add CLEROAPITOKEN to server .env**

На сервере (SSH `root@212.67.9.173`):
```bash
echo "CLEROAPITOKEN=src7XE3WlA9Yw4Cs376IfHM1YyPP2fkhwPf" >> /var/www/neeklo.ru/neeklo-ai-path/.env
```
⚠️ Не коммитить `.env` с токеном.

- [ ] **Step 2: Run all tests locally**

```bash
cd neeklo-ai-path && npm test
```

Expected: все тесты PASS (включая clero-integration.server.test)

- [ ] **Step 3: Deploy**

```bash
ssh -i ~/.ssh/id_ed25519 root@212.67.9.173 "cd /var/www/neeklo && bash deploy.sh"
```

- [ ] **Step 4: Health check**

```bash
curl -s https://neeklo.ru/api/v1/public/case-studies | head -c 100
```

Expected: JSON с кейсами (не ошибка)

- [ ] **Step 5: Verify clero_sent in DB after webhook**

После получения тестового вебхука от Avito — проверить, что флаг записан:

```bash
ssh root@212.67.9.173 "cd /var/www/neeklo.ru/neeklo-ai-path && node -e \"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.cmsSetting.findUnique({ where: { key: 'integrations.avito.clero_sent' } }).then(r => {
  console.log(JSON.stringify(r?.value, null, 2));
  p.\$disconnect();
});
\""
```

Expected: объект с chatId → true

- [ ] **Step 6: Test sync-all button**

Открыть `https://neeklo.ru/admin/avito/chats`, нажать «Отправить все в Clero».  
Expected: тост «Clero: отправлено N, пропущено M»

---

## Self-Review

**Spec coverage:**
- ✅ Авто-отправка первого клиентского сообщения из webhook → Task 5
- ✅ Дедупликация по chatid → Tasks 3+5
- ✅ `CLEROAPITOKEN` в `.env` → Task 1
- ✅ Флаг `sent_to_clero` в DB → Task 3
- ✅ Лог при ошибке, не блокирует webhook → Task 5 Step 2
- ✅ Endpoint `POST /avito/clero/sync-all` → Task 6
- ✅ Кнопка в `/admin/avito/chats` → Task 7
- ✅ sync-all берёт первые 3 клиентских сообщения → Task 6

**Type consistency:**
- `sendToClero(chatId, authorId, messageText)` — одинакова в Task 4 и Task 5 ✅
- `getCleroSentChats()` возвращает `Record<string,true>` — используется в Task 5 и Task 6 ✅
- `buildCleroPayload` в `clero-helpers.mjs` — используется в `sendToCleroRaw` ✅

**Placeholder scan:** нет TBD/TODO ✅
