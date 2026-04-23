# Как создать КП для нового клиента

Когда Никита пишет **«создай КП для клиента X»** — следуй этому порядку.

---

## 1. Собери бриф

Минимум для старта:
- Название клиента (как на визитке)
- Ниша / отрасль одной строкой
- 3–4 болевые точки (словами клиента, из звонка)
- Пакеты с ценами (Start / Pro / третий вариант)
- Дедлайн проекта (сколько недель)
- Что будет в Фазе 2 и примерная цена

Если чего-то нет — **спроси у Никиты** прежде чем заполнять.

---

## 2. Придумай slug

**Правила:**
- Только латиница lower-case, цифры и дефис
- Коротко: `asp`, `livegrid`, `da-motors` — не `asp-business-2026`
- Уникально в рамках БД (проверь `GET /api/kp/all`)

---

## 3. Убедись что серверы запущены

```bash
# Vite dev server
curl http://localhost:8080 -o /dev/null -w "%{http_code}"   # должно быть 200

# CMS API
curl http://127.0.0.1:8787/api/kp -o /dev/null -w "%{http_code}"  # должно быть 200
```

Если серверы упали — перезапусти:
```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
node server/cms-server.mjs > /tmp/cms-server.log 2>&1 &
npm run dev > /tmp/vite.log 2>&1 &
```

---

## 4. Создай КП через API

### Шаг 4.1 — получи токен
```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dsc-23@yandex.ru","password":"123123123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

### Шаг 4.2 — POST /api/kp
```bash
curl -X POST http://127.0.0.1:8787/api/kp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "slug": "{slug}",
    "clientName": "{Название клиента}",
    "clientIndustry": "{Ниша}",
    "kpNumber": "YYYY-MM-DD-NNN",
    "expiresDays": 14,
    "published": true,
    "heroData": { ... },
    "problemsData": { ... },
    "solutionData": { ... },
    "packagesData": { ... },
    "includedData": { ... },
    "timelineData": { ... },
    "nextPhaseData": { ... },
    "whyUsData": { ... },
    "ctaData": { ... },
    "contactsData": { ... }
  }'
```

Структуру полей смотри в `kp-asp-business.html` или в типах `src/lib/cms-api.ts`.

---

## 5. Проверь локально

```
http://localhost:8080/kp/{slug}
```

Проверить:
- [ ] Все блоки отображаются
- [ ] Шрифты Unbounded / Manrope загрузились
- [ ] Мобильный режим (375px в DevTools)
- [ ] Кнопки CTA ведут на правильный URL
- [ ] viewsCount увеличивается при повторном открытии

---

## 6. Обновить КП

```bash
curl -X PUT http://127.0.0.1:8787/api/kp/{slug} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "packagesData": { ... } }'   # только те поля, которые меняются
```

---

## 7. Закоммить в git

```bash
git add .
git commit -m "feat(kp): add KP for {clientName} ({slug})"
```

---

## 8. Записать в Notion

Открыть карточку клиента в БД "Проекты".
В поле "КП" (или "Ссылка на ТЗ") записать URL:
```
http://localhost:8080/kp/{slug}           ← локально
https://neeklo.ru/kp/{slug}               ← после деплоя
```
Статус → `БРИФ` или `РЕВЬЮ`.

---

## Структура JSON-полей

### heroData
```json
{
  "title_line_1": "Сайт и цифровая витрина",
  "title_line_2": "для {Клиент}",
  "subtitle": "Одна строка про задачу клиента — суть оффера.",
  "stats": [
    { "num": "3", "unit": "мес", "label": "До запуска" },
    { "num": "4", "unit": "",    "label": "Направления" },
    { "num": "3", "unit": "",    "label": "Пакета" },
    { "num": "50","unit": "%",   "label": "Предоплата" }
  ]
}
```

### problemsData
```json
{
  "title_1": "Четыре проблемы,",
  "title_2": "которые решает проект",
  "items": [
    { "num": "01", "title": "...", "text": "3–4 строки, словами клиента" },
    { "num": "02", "title": "...", "text": "..." },
    { "num": "03", "title": "...", "text": "..." },
    { "num": "04", "title": "...", "text": "..." }
  ]
}
```

### packagesData
```json
{
  "title_1": "Три пакета —",
  "title_2": "от базового до подписки",
  "items": [
    {
      "name": "Start", "subtitle": "Базовый сайт",
      "price": "150", "price_sub": "тыс. руб. · разово · 50% предоплата",
      "featured": false, "badge": "", "cta": "Выбрать Start",
      "features": ["Фича 1", "Фича 2"]
    },
    {
      "name": "Pro", "subtitle": "Сайт + воронка",
      "price": "220", "price_sub": "тыс. руб. · разово · 50% предоплата",
      "featured": true, "badge": "ОПТИМАЛЬНО", "cta": "Выбрать Pro",
      "features": ["Всё из Start, плюс:", "Фича 3"]
    },
    {
      "name": "Подписка", "subtitle": "Спринты 1–3 мес",
      "price": "80–120", "price_sub": "тыс. руб. / месяц",
      "featured": false, "badge": "", "cta": "Выбрать Подписку",
      "features": ["Фича A", "Фича B"]
    }
  ]
}
```

**Правила пакетов:**
- Один пакет всегда `"featured": true` (обычно средний)
- `price` — строка без ₽ и пробелов: `"150"`, `"80–120"`
- Если пакетов 2 или 4 — нужно скорректировать grid в CSS (`.kp-packages`)

### contactsData (одинаковый для всех КП)
```json
{
  "telegram_handle": "@neeeekn",
  "telegram_url": "https://t.me/neeeekn",
  "email": "neeklostudio@gmail.com",
  "site": "neeklo.ru",
  "site_url": "https://neeklo.ru"
}
```

---

## Витрина /kp

Страница `/kp` (без slug) — общая витрина. Данные берутся из CmsSetting с ключом `kp.showcase`.

Обновить через admin → Settings → `kp.showcase` (JSON-значение).

---

## Дизайн-токены КП (не менять)

```
--ink:        #0D0F12   тёмный фон (основной)
--paper:      #EAE7DE   кремовый (секции пакетов и CTA)
--accent:     #F5A623   оранжевый — главный акцент
--warn:       #FF6B4A   коралловый (бейдж "ОПТИМАЛЬНО")
--text-paper: #F5F3EE   белый текст на тёмном
--text-ink:   #0D0F12   чёрный текст на светлом
```

Шрифты: **Unbounded** (display) · **Manrope** (body) · **JetBrains Mono** (mono/цифры)

---

## Чек-лист перед отправкой клиенту

- [ ] `clientName` совпадает с визиткой клиента
- [ ] Все цены соответствуют обсуждённым на звонке
- [ ] Контакты актуальны (TG, email, сайт)
- [ ] `kpNumber` уникален (формат `YYYY-MM-DD-NNN`)
- [ ] Проверено в мобильном 375px
- [ ] CTA-кнопки ведут на правильный URL
- [ ] Нет опечаток (прочитать вслух)
- [ ] `expiresDays: 14` (или другое по договорённости)
- [ ] URL записан в Notion-карточку клиента
