# Тестирование neeklo (автоматизация + ручная проверка заказчиком)

## Юнит и компоненты (Vitest)

```bash
npm test
# или
npm run test:watch
```

Покрыто:

- `src/lib/client-session.ts` — флаг сессии и безопасный `?next=` для редиректа после входа.
- `src/components/BottomNav.tsx` — подписи ≥13px, переход на `/chat` со второго таба.
- `server/services/ai.service.mjs` — `chunkText`: короткий текст даёт мало чанков (RAG).

## E2E smoke (Playwright)

Конфиг: `playwright.neeklo.config.ts` — `baseURL` **http://localhost:8080** (на Windows надёжнее, чем `127.0.0.1`). Браузер: **системный Chrome** (`channel: "chrome"`). При отсутствии Chrome: `npx playwright install chromium`.

Запуск (поднимет Vite на `8080` сам, либо использует уже запущенный `npm run dev`):

```bash
npm run test:e2e
```

Сценарии в `e2e/smoke.spec.ts`: главная, `/services`, гостевой `/profile`, вход с `?next=/profile`.

**API:** прокси Vite ждёт CMS на `127.0.0.1:8787`. Без него в логах будут `ECONNREFUSED`, но smoke-тесты проходят за счёт fallback UI. Для проверки с реальным контентом запустите `npm run cms-server` параллельно.

**Заказчик:** iPhone, жесты, клавиатура, Safari — вне автотестов; чеклист в `docs/NEEKLO-RU-TASKS-MAPPING.md`.

## Полный прогон

```bash
npm run test:all
```

Требует установленных браузеров Playwright.
