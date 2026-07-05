# AUDIT REPORT — neeklo-ai-path

> Дата: 2026-06-15  
> Проект: `Neeklo1606/neeklo-ai-path` → https://neeklo.ru/  
> Анализ без изменений кода.

---

## 1. Общая картина

| Метрика | Значение |
|---|---|
| TSX файлов | 195 |
| TS файлов | 46 |
| Всего строк кода | ~30 800 |
| Главный бандл (index.js) | **596 KB** (187 KB gzip) |
| Статус сборки | ✅ без ошибок |
| TSC errors | 0 |

**Главная проблема:** бандл `index.js` в 596 KB превышает лимит Vite в 500 KB. Это значит что основной чанк слишком большой — часть кода, которая должна быть lazy-loaded, попала в main bundle.

Самые тяжёлые чанки:
- `index-_g3elSyl.js` — 596 KB (главный, проблемный)
- `AdminPageEditor` — 85 KB (page builder)
- `AdminPage` — 77 KB (kanban)
- `axios` — 37 KB отдельным чанком (можно заменить на fetch)

---

## 2. Мёртвый код

### Supabase — установлен, но не используется
`@supabase/supabase-js` в dependencies. Единственный файл — `src/integrations/supabase/client.ts` — клиент который **нигде не импортируется**. Это 36 KB мёртвого груза в бандле.

### Дублирующиеся admin-роуты (одна страница — два пути)
```
/admin/leads       → AdminCrmPage  (дубль)
/admin/crm         → AdminCrmPage  (основной)

/admin/chats       → AdminOperatorPage  (дубль)
/admin/operator    → AdminOperatorPage  (основной)

/admin/blog-posts  → AdminBlogPage  (дубль)
/admin/blog        → AdminBlogPage  (основной)

/admin/services    → AdminSitePagesPage  (дубль)
/admin/site-pages  → AdminSitePagesPage  (основной)

/admin/crm         → AdminCrmDashboard  (конфликт с AdminCrmPage выше!)
```
Роуты `/admin/leads`, `/admin/chats`, `/admin/blog-posts`, `/admin/services` — алиасы без назначения. Плюс `/admin/crm` задан дважды для разных компонентов — это баг.

### 5 идентичных service-страниц (31 строка каждая)
```
src/pages/services/ServiceAiAssistant.tsx  — 31 строк
src/pages/services/ServiceAiVideo.tsx      — 31 строк
src/pages/services/ServiceTelegram.tsx     — 31 строк
src/pages/services/ServiceWeb.tsx          — 31 строк
src/pages/services/ServiceEducation.tsx    — 31 строк
```
Все 5 файлов — обёртки одного шаблонного компонента с разным `slug`. Можно заменить одним роутом `/services/:slug`.

### next-themes установлен, но не используется
Есть своя реализация `src/hooks/useTheme.ts`. `next-themes` в package.json — лишний.

### Неиспользуемые npm-пакеты (серверные в клиентском package.json)
Следующие пакеты нужны только серверу (`server/*.mjs`), но попали в `package.json` фронтенда:
- `express`, `cors` — HTTP-сервер
- `@prisma/client`, `prisma` — ORM
- `bullmq`, `ioredis` — очереди Redis
- `bcryptjs`, `jsonwebtoken` — авторизация
- `sharp`, `mammoth`, `pdf-parse`, `multer` — обработка файлов
- `@qdrant/js-client-rest` — векторная БД
- `dotenv` — env-переменные (Vite это делает сам)

Это **11 серверных пакетов** в клиентских зависимостях. Они не попадают в браузерный бандл (tree-shaking), но засоряют `node_modules` и замедляют установку.

---

## 3. Дублирование

### Telegram-ссылка хардкожена в 30+ местах
`https://t.me/neeekn` или `@neeekn` встречается в файлах:
- `Footer.tsx` (3 раза)
- `WebsitesPage.tsx` (3 раза)
- `VideoPage.tsx` (3 раза)
- `AIAgentsPage.tsx` (3 раза)
- `MainNav.tsx`, `SuccessScreen.tsx`, `TelegramManagerButton.tsx`, `ServiceCTA.tsx`, `HomeFinalCTA.tsx`, `ContactPage.tsx`, `ServicesPage.tsx`, `KpShowcasePage.tsx`, `KpSlugPage.tsx`, `AdminPage.tsx`, `cms/CmsHomePage.tsx`

Всего ~30 вхождений. Константа `TELEGRAM_URL` есть только в `MainNav.tsx` и `TelegramManagerButton.tsx` — не вынесена в единый файл.

### Два toast-провайдера одновременно
В `App.tsx` подключены оба:
- `Toaster` из shadcn/ui (`@radix-ui/react-toast`)  
- `Sonner` (отдельная библиотека)

Используются в разных местах. Нужен один.

### axios vs fetch — смешанный подход
- `axios` — используется в 15 admin-файлах напрямую (без обёртки)
- `fetch` — в остальных местах  
- `src/lib/admin-api.ts` — есть общий клиент на axios, но используется не везде

### Хардкоженные цвета в inline-стилях
`ChatInput.tsx`, `TelegramManagerButton.tsx`, `QuickChips.tsx`, `ChatMessage.tsx`, `BrandLogo.tsx` используют `#0D0D0B`, `#F5F4F0`, `#D0D0D0`, `#2AABEE` напрямую в `style={{}}` вместо CSS-переменных.

---

## 4. Сложные компоненты (God Components)

| Файл | Строк | Хуков | Проблема |
|---|---|---|---|
| `AdminKnowledgePage.tsx` | 878 | 45 | Управление RAG-базой, загрузка файлов, граф — всё в одном |
| `AdminPage.tsx` | 1440 | 41 | Kanban + чаты + аналитика + настройки |
| `AdminPageEditor.tsx` | 640 | 31 | Page builder |
| `AdminKnowledgeGraphPage.tsx` | 462 | 29 | Граф знаний |
| `ChatPage.tsx` | 628 | 27 | Чат + история + ввод |
| `BriefWizard.tsx` | 548 | 15 | 5-шаговый wizard в одном файле |
| `CasesPage.tsx` | 602 | 12 | Каталог + фильтры + карточки |
| `HeroNew.tsx` | 400 | 12 | Анимации + видео + форма |

**Главный кандидат:** `AdminPage.tsx` (1440 строк, 41 хук) — это 3-4 разных страницы в одном файле.

---

## 5. Хардкод и константы

### Нет единого файла констант
Следующее разбросано по проекту:
- Telegram: `https://t.me/neeekn` — 30+ вхождений
- Email: `neeeklostudio@gmail.com` — в Footer и AdminPage
- Цвета бренда: `#0D0D0B` (почти чёрный) — 10+ inline-стилей

Нужен `src/constants/index.ts` или `src/config.ts`.

---

## 6. TypeScript

| Проверка | Результат |
|---|---|
| TSC errors | **0** ✅ |
| `as any` / `: any` | 9 вхождений (некритично) |
| `strictNullChecks` | **выключен** ⚠️ |
| `noImplicitAny` | **выключен** ⚠️ |
| `noUnusedLocals` | **выключен** |

TypeScript настроен мягко. Включение `strict` вероятно вскроет 50-100+ ошибок, но это не блокирует сборку сейчас.

---

## 7. Структура роутов

**Lazy loading:** 61 из 79 роутов используют `lazy()` — хорошо.

**Проблемы:**
1. Конфликт `/admin/crm` — задан дважды (для `AdminCrmPage` и `AdminCrmDashboard`)
2. 4 алиас-роута без пользы (`/leads`, `/chats`, `/blog-posts`, `/services`)
3. 5 отдельных файлов `/services/ServiceXxx.tsx` (по 31 строке каждый) вместо одного dynamic route

---

## 8. ПЛАН ОПТИМИЗАЦИИ

### Приоритет 1 — Быстро и безопасно (1-2 часа, риск: низкий)

**1.1 Вынести Telegram-константы в один файл**
- Создать `src/constants/index.ts` с `TELEGRAM_URL`, `TELEGRAM_HANDLE`, `EMAIL`
- Заменить 30+ хардкодов на импорт
- Файлы: все что grep показал выше
- Риск: низкий | Время: 30 мин

**1.2 Удалить дублирующиеся admin-роуты**
- Удалить `/admin/leads`, `/admin/chats`, `/admin/blog-posts`, `/admin/services`
- Исправить конфликт `/admin/crm`
- Файлы: `src/App.tsx`
- Риск: низкий (если ссылки на эти пути нигде не используются) | Время: 15 мин

**1.3 Удалить Supabase**
- Удалить `src/integrations/supabase/`
- Удалить `@supabase/supabase-js` из package.json
- Риск: низкий (не используется) | Время: 10 мин

**1.4 Удалить next-themes**
- Уже есть свой `useTheme.ts`
- `npm uninstall next-themes`
- Риск: низкий | Время: 5 мин

**1.5 Перенести серверные зависимости в отдельный package.json**
- Создать `server/package.json` для express/prisma/bullmq/etc
- Убрать их из корневого package.json
- Риск: средний (нужно проверить deploy.sh) | Время: 30 мин

---

### Приоритет 2 — Средняя сложность (4-8 часов, риск: средний)

**2.1 Объединить 5 идентичных service-страниц**
- Удалить `src/pages/services/Service*.tsx` (5 файлов × 31 строка)
- Использовать существующий `ServiceDetailPage.tsx` + `/services/:slug`
- Файлы: `src/App.tsx`, 5 файлов страниц
- Риск: средний | Время: 1 час

**2.2 Единый API-клиент для admin**
- Расширить `src/lib/admin-api.ts` на все axios-вызовы
- Убрать прямые `import axios` из 14 admin-страниц
- Риск: средний | Время: 2-3 часа

**2.3 Заменить два toast на один**
- Выбрать `sonner` (более современный) или shadcn toast
- Убрать дублирующий провайдер из `App.tsx`
- Риск: средний | Время: 1 час

**2.4 Исправить main bundle > 500 KB**
- Проверить что попало в `index.js` — вероятно общие компоненты без lazy
- Добавить `manualChunks` в `vite.config.ts` для vendor-либов (framer-motion, recharts)
- Риск: низкий | Время: 1 час

---

### Приоритет 3 — Требует осторожности (отдельные PR, риск: высокий)

**3.1 Разбить AdminPage.tsx (1440 строк)**
- Kanban → `AdminKanbanView.tsx`
- Чаты → `AdminChatsView.tsx`  
- Аналитика → `AdminAnalyticsView.tsx`
- Риск: высокий | Время: 4-6 часов

**3.2 Разбить AdminKnowledgePage.tsx (878 строк, 45 хуков)**
- Загрузка файлов → `KnowledgeUploader.tsx`
- RAG-поиск → `KnowledgeSearch.tsx`
- Список документов → `KnowledgeList.tsx`
- Риск: высокий | Время: 4-6 часов

**3.3 Включить TypeScript strict поэтапно**
- Сначала `strictNullChecks: true` → исправить ошибки
- Потом `noImplicitAny: true`
- Риск: высокий (много ошибок) | Время: 8-16 часов

---

## Итоговые цифры

| Проблема | Кол-во | Что сделать |
|---|---|---|
| Хардкод Telegram-ссылки | ~30 мест | Приоритет 1 |
| Дублирующиеся роуты | 4 алиаса + 1 конфликт | Приоритет 1 |
| Серверные пакеты в клиенте | 11 пакетов | Приоритет 1 |
| Мёртвый Supabase | 1 файл | Приоритет 1 |
| Идентичные service-файлы | 5 файлов | Приоритет 2 |
| Прямые axios без обёртки | 14 файлов | Приоритет 2 |
| Бандл > 500 KB | 596 KB | Приоритет 2 |
| God Components (1000+ строк) | 2 файла | Приоритет 3 |
| TypeScript non-strict | весь проект | Приоритет 3 |
