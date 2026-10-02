# AUDIT — карта проекта neeklo.ru

- Дата: 2026-09-15
- Коммит: `776d20a` (ветка `main`, github.com/Neeklo1606/neeklo-ai-path)
- Режим: только чтение. Код, БД и сервисы не менялись. Проверки на проде — только GET-запросы без авторизации.
- Прод: сервер `212.67.9.173`, путь `/var/www/neeklo.ru`, PM2-процесс `neeklo-api`, порт 3001, PostgreSQL `neeklo_cms`.

**Как устроено**
- **Фронтенд.** React + Vite, код в `src/`, сборка в `dist/`, отдаёт nginx.
- **Бэкенд.** Один Express-файл `server/cms-server.mjs` (5107 строк, 131 роут) + Prisma (`prisma/schema.prisma`).
- **Проксирование nginx** (`/etc/nginx/sites-enabled/neeklo.ru`):

| Путь на сайте | Куда уходит |
|---|---|
| `/cms-api/*` | Express, **с отрезанием префикса** (`/cms-api/cases` → `app.get("/cases")`) |
| `/avito/*`, `/api/clero/*`, `/tg/*`, `/incoming/*` | Express, без изменения пути |
| остальное | SPA `dist/index.html` |

  Поэтому `https://neeklo.ru/api/...` — это SPA, а не API. Живая проверка API: `https://neeklo.ru/cms-api/health`.

---

## 0. Критичные находки (сначала прочитать)

| # | Что | Где | Последствие |
|---|---|---|---|
| К1 | **`POST /internal/deploy` без авторизации.** Через `execSync` запускает `bash /var/www/neeklo.ru/deploy.sh` от root. Снаружи доступен как `POST https://neeklo.ru/cms-api/internal/deploy`. | `server/cms-server.mjs:1061-1072` | Любой в интернете может запустить деплой: `git reset --hard`, `npm install`, сборку, `pg_dump`, `prisma db push`, рестарт API. Можно положить сайт или забить диск дампами. Запросом не проверял — это запустило бы деплой. |
| К2 | **Заявки из BriefWizard никуда не уходят.** Кнопка «Обсудить проект» открывает `BriefWizard`. При отправке данные пишутся только в `sessionStorage` (`neeklo_wizard_brief`), ничего не отправляется на сервер. Этот ключ никто не читает. | `src/components/BriefWizard.tsx:26`, `:117-119` | Эти заявки теряются. Визард открывают: `Footer`, `BottomNav` (центральная кнопка), `HomeProcess`, `HomeCases`, `CmsHomePage` → `HeroNew`, `ServicesPage`, `ProductPage`. В БД доходит только `QuickLeadForm` (см. §6.2). |
| К3 | **9 разделов админки ходят в несуществующие эндпоинты (404 на проде).** Обработчиков нет и никогда не было в истории git. | см. §3 | Блог, Видео, Регламенты, База знаний (статьи), CRM-дашборд, CRM-контакты, CRM-канбан (сделки), Дашборд (`/admin/stats`) не работают. Таблицы `blog_posts`, `case_videos`, `video_categories`, `regulations`, `knowledge_articles`, `crm_contacts`, `crm_deals` не имеют API. |
| К4 | **`deploy.sh` падает на `prisma db push`.** В БД `service_prices.id` = `varchar`, в схеме `String` (= `text`). Prisma хочет пересоздать первичный ключ. | `prisma/schema.prisma:414-428`, `deploy.sh` (секция PRISMA) | Деплой обрывается до `pm2 restart` и `nginx -t`. К этому моменту фронтенд уже подменён: `dist` обновляется, API — нет. Таблицу читает Avito-агент (§4), трогать осторожно. |
| К5 | **`deploy.sh` делает `git fetch && git reset --hard` внутри себя.** Bash выполняет версию скрипта, которая лежала на диске до reset. | `deploy.sh:9-11` | Если скрипт менялся в новом коммите, первый прогон идёт по старой логике. Правильно: сначала `git fetch && git reset --hard origin/main` вручную, потом `bash deploy.sh`. Все незакоммиченные правки на сервере стираются. |
| К6 | **Подпись Avito-вебхука не проверяется, если секрет не задан** (`permissive_no_secret`). В `.env` прода `AVITO_WEBHOOK_SECRET` пуст. Задан ли `webhookSecret` у аккаунта в `cms_settings`, не проверял: это секрет. | `server/cms-server.mjs:884-887`, `:3960-3962` | Если секрета нет и у аккаунта, любой может слать поддельные «сообщения Avito» на `/avito/webhook/:agentId`. Они попадут в CRM, уведомления Telegram и ответы AI-агента. |
| К7 | **Раздел «Страницы сайта» (`/admin/site-pages`) пишет в никуда.** Сохраняет ключи `page.{home,contacts,services}.*` в `cms_settings`. PATCH без `is_public` ставит `isPublic=false`, а редактор читает `GET /settings/public`, где только публичные ключи. | `src/pages/admin/AdminSitePagesPage.tsx:57-74`, `server/cms-server.mjs:1900-1919` | Сайт эти ключи не читает. После сохранения поля в самом редакторе снова пустые. |

---

## РАЗДЕЛ 1 — Карта роутов (`src/App.tsx`)

Обёртки (`src/App.tsx:118-145`):
- **`Layout`** на всех страницах рисует `MainNav`, `BottomNav` (только мобильный), `StickyCTA`, `TelegramManagerButton`.
- **`SeriesRail`** — только на `/`.
- **Без навигации** (`HIDE_NAV_ROUTES`, `:116`): `/chat*`, `/manager-chat*`, `/kp*`, `/admin*`.
- **`CookieBanner`** — глобально (`:262`).
- **`BriefProvider`** (`src/context/BriefContext.tsx`) — глобально, рендерит `BriefWizard`.

### 1.1 Публичные роуты

| Строка | Путь | Компонент | Тип | Статус | Заметки |
|---|---|---|---|---|---|
| 169 | `/` | `src/pages/Index.tsx` → `src/components/cms/CmsHomePage.tsx` | публичный | **живой** | Несмотря на имя «Cms», главная полностью хардкод. Страница `home` в `cms_pages` существует, но не используется. |
| 170 | `/login` | `src/pages/LoginPage.tsx` | публичный | **заглушка** | Логина нет: `setClientSession()` пишет флаг `neeklo_client_session=1` в localStorage (`src/lib/client-session.ts`). |
| 171 | `/register` | `src/pages/RegisterPage.tsx` | публичный | **заглушка** | То же, после «регистрации» переход на `/chat`. |
| 172 | `/chat` | `src/pages/ChatPage.tsx` | публичный (без навигации) | живой | AI-чат: `GET /chat/bootstrap` + `POST /chat`, пишет в `crm_chats`/`crm_leads`. |
| 173 | `/services` | `src/pages/ServicesPage.tsx` | публичный | живой | |
| 174 | `/works` | `src/pages/WorksPage.tsx` | публичный | **legacy** | Старая витрина работ из CMS-страницы `works`. Актуальная — `/cases`. |
| 175 | `/cases` | `src/pages/CasesPage.tsx` | публичный | **живой** | Кейсы из БД. Вкладка «Видео» сломана (К3). |
| 176 | `/blog` | `src/pages/BlogPage.tsx` | публичный | живой | API `/blog` отдаёт 404, всегда показывается фолбэк `src/data/news.ts`. |
| 177 | `/blog/:slug` | `src/pages/BlogPostPage.tsx` | публичный | живой | Только `src/data/news.ts`. |
| 178 | `/projects` | `src/pages/ProjectsPage.tsx` | «кабинет клиента» | **демо/legacy** | Контент из CMS-страницы `projects`. Реальных проектов клиента нет. |
| 179 | `/projects/:id` | `src/pages/ProjectDetailPage.tsx` | «кабинет клиента» | **демо** | Моковые данные внутри файла. |
| 180 | `/profile` | `src/pages/ProfilePage.tsx` | «кабинет клиента» | **заглушка** | Показывает вход, если нет флага localStorage. |
| 181 | `/settings` | `src/pages/SettingsPage.tsx` | «кабинет клиента» | **заглушка** | Язык/тема, 50 строк. |
| 182 | `/services/ai-video` | `src/pages/services/ServiceAiVideo.tsx` | публичный | живой | Данные `src/data/services/aiVideo.ts`. |
| 183 | `/services/web` | `src/pages/services/ServiceWeb.tsx` | публичный | живой | `src/data/services/web.ts` |
| 184 | `/services/ai-assistant` | `src/pages/services/ServiceAiAssistant.tsx` | публичный | живой | `src/data/services/aiAssistant.ts` |
| 185 | `/services/telegram` | `src/pages/services/ServiceTelegram.tsx` | публичный | живой | `src/data/services/telegram.ts` |
| 186 | `/services/education` | `src/pages/services/ServiceEducation.tsx` | публичный | живой | `src/data/services/education.ts` |
| 187 | `/services/consulting` | `src/pages/services/ServiceConsulting.tsx` | публичный | живой | Хардкод в самом файле (265 строк) + `QuickLeadForm`. |
| 188 | `/services/:slug` | `src/pages/ServiceDetailPage.tsx` | публичный | **legacy** | Свой словарь `services` в файле (`:26-92`): слаги `ai-roliki`, `sajt-pod-klyuch`, `telegram-mini-app`, `ai-agent`. Тексты в `useLanguage` (`sdet.*`). Живые слаги перехватываются роутами 182-187. |
| 189 | `/order/:serviceId` | `src/pages/OrderPage.tsx` | публичный | **заглушка** | `handleSubmit` (`:36-37`) только `setSubmitted(true)`, никуда не отправляет. |
| 190 | `/manager-chat` | `src/pages/ManagerChatPage.tsx` | публичный (без навигации) | **демо** | `initialMessages` и ответы через `setTimeout` (`:24-50`), живого менеджера нет. |
| 191 | `/notifications` | `src/pages/NotificationsPage.tsx` | «кабинет клиента» | **демо** | Моковый список, `setTimeout` (`:56`). |
| 192 | `/legal/:slug` | `src/pages/LegalPage.tsx` | публичный | **legacy** | CMS-страница `legal`. Актуальные документы — `/privacy`, `/offer`, `/cookies`. |
| 193 | `/privacy` | `src/routes/privacy.tsx` | публичный | живой | Хардкод |
| 194 | `/offer` | `src/routes/offer.tsx` | публичный | живой | Хардкод |
| 195 | `/cookies` | `src/routes/cookies.tsx` | публичный | живой | Хардкод |
| 250 | `/contact` | `src/pages/ContactPage.tsx` | публичный | живой | Хардкод + `src/constants/index.ts` |
| 251 | `/products/websites` | `src/pages/products/WebsitesPage.tsx` | публичный | **живой** (главное меню) | Хардкод, 409 строк |
| 252 | `/products/ai-agents` | `src/pages/products/AIAgentsPage.tsx` | публичный | **живой** | Хардкод, 330 строк |
| 253 | `/products/video` | `src/pages/products/VideoPage.tsx` | публичный | **живой** | Хардкод, 349 строк |
| 254 | `/products/:slug` | `src/pages/products/ProductPage.tsx` | публичный | **legacy/мёртвый** | Берёт `getProduct(slug)` из `src/data/products.ts`, но все его id (`websites`, `ai-agents`, `video`) перехвачены роутами 251-253. Любой другой slug — «не найден». |
| 255 | `/kp` | `src/pages/kp/KpShowcasePage.tsx` | публичный (без навигации) | живой | Настройка `kp.showcase` из `/settings/public`. На проде её нет, работает `DEFAULT_SHOWCASE` (`:27`). |
| 256 | `/kp/:slug` | `src/pages/kp/KpSlugPage.tsx` | публичный по ссылке | живой | `GET /api/kp/:slug` → `commercial_offers`. Сейчас `GET /api/kp` = `[]`. |
| 257 | `*` | `src/pages/NotFound.tsx` | публичный | живой | |

### 1.2 Админские роуты (под `AdminAuthGuard` + `AdminLayout`)

| Строка | Путь | Компонент | В сайдбаре? |
|---|---|---|---|
| 198 | `/admin/login` | `src/pages/admin/AdminLoginPage.tsx` | — (публичный) |
| 205/206 | `/admin`, `/admin/dashboard` | `AdminDashboardPage.tsx` | да (`/admin`) |
| 209 | `/admin/kanban` | `src/pages/AdminPage.tsx` (1441 строка) | **нет** |
| 210 | `/admin/operator` | `AdminOperatorPage.tsx` | **нет** |
| 211/212 | `/admin/avito`, `/admin/avito/:section` | `AdminAvitoPage.tsx` | да (`avito/config`, `accounts`, `webhook`, `items`, `chats`, `events`) |
| 215 | `/admin/cases` | `AdminCasesPage.tsx` | да |
| 216 | `/admin/videos` | `AdminVideosPage.tsx` | да |
| 217 | `/admin/blog` | `AdminBlogPage.tsx` | да |
| 218 | `/admin/site-pages` | `AdminSitePagesPage.tsx` | да |
| 221/222 | `/admin/pages`, `/admin/pages/:id` | `AdminPagesList.tsx`, `AdminPageEditor.tsx` | **нет** |
| 225 | `/admin/media` | `AdminMediaPage.tsx` | да |
| 226 | `/admin/branding` | `AdminBrandingPage.tsx` | **нет** |
| 227/228 | `/admin/assistants`, `/admin/assistants/:id` | `AdminAssistantsPage.tsx`, `AdminAssistantEditor.tsx` | **нет** |
| 229 | `/admin/ai-analytics` | `AdminAiAnalyticsPage.tsx` | **нет** |
| 230 | `/admin/billing` | `AdminBillingPage.tsx` | **нет** |
| 231/232 | `/admin/knowledge`, `/admin/knowledge/graph` | `AdminKnowledgePage.tsx`, `AdminKnowledgeGraphPage.tsx` | **нет** |
| 233 | `/admin/knowledge-base` | `AdminKnowledgeBasePage.tsx` | да |
| 234 | `/admin/regulations` | `AdminRegulationsPage.tsx` | да |
| 235 | `/admin/crm` | `AdminCrmDashboard.tsx` | **нет** |
| 236 | `/admin/crm/contacts` | `AdminContactsPage.tsx` | да |
| 237 | `/admin/crm/kanban` | `AdminCrmKanbanPage.tsx` | да («Проекты») |
| 238/239 | `/admin/settings`, `/admin/settings/item/:settingKey` | `AdminSettingsPage.tsx`, `AdminSettingEditor.tsx` | да |
| 242 | `/admin/telegram` | `AdminTelegramPage.tsx` | да |
| 243 | `/admin/ai-agent` | `AdminAiAgentPage.tsx` | да |
| 244 | `/admin/global-knowledge` | `AdminGlobalKnowledgePage.tsx` | да |
| 245 | `/admin/pricing` | `AdminPricingPage.tsx` | да |
| 246 | `/admin/test-chat` | `AdminTestChatPage.tsx` | да |

- **Битая ссылка в сайдбаре:** `/admin/chats` («Чаты», `src/pages/admin/AdminLayout.tsx:26`) — такого роута нет. Реальный экран чатов — `/admin/operator` или `/admin/kanban`.
- Импорт `AdminCmsShell` (`App.tsx:47`) нигде не используется.

### 1.3 Роуты без входа из навигации

Навигация: `MainNav` (`src/components/layout/MainNav.tsx:10-17`), `Footer` (`src/components/Footer.tsx:8-13`, `:62-65`, `:110-117`), `BottomNav` (`src/components/layout/BottomNav.tsx:13-19`).

| Путь | Откуда можно попасть | Вывод |
|---|---|---|
| `/works` | Ссылок нет (только `seeAllPath` в `src/components/admin/page-builder/block-registry.ts:64`) | **не залинкован** |
| `/order/:serviceId` | ссылок нет | **не залинкован** |
| `/legal/:slug` | ссылок нет | **не залинкован** |
| `/services/:slug` (legacy-слаги) | только `src/components/SearchOverlay.tsx:49` (компонент мёртвый, §1.4) | **не залинкован** |
| `/products/:slug` (кроме трёх живых) | ссылок нет | **не залинкован** |
| `/services/education` | только `src/data/homeData.ts:68` (используется в мёртвом `HomeHero`). В `src/data/solutions.ts` education нет. | **не залинкован** |
| `/cookies` | ссылок нет. В футере только `/privacy` и `/offer`. | **не залинкован** |
| `/kp`, `/kp/:slug` | ссылок нет, КП отправляют ссылкой вручную | не залинкован (так задумано) |
| `/chat` | ссылки из мёртвых навигаций (`src/components/BottomNav.tsx:12`, `src/components/DesktopNav.tsx:17`, `layout/MobileHeader.tsx:11`); `RegisterPage.tsx:19`, `WorksPage.tsx:52,283`, `ServiceDetailPage.tsx:177` — все legacy | фактически **не залинкован** из живого сайта |
| `/manager-chat` | `ProjectDetailPage.tsx:91`, `NotificationsPage.tsx:37` (демо) | только из демо-страниц |
| `/projects`, `/projects/:id` | из мёртвых навигаций; `ProfilePage.tsx:23`, `ManagerChatPage.tsx:64` | только из «кабинета» |
| `/notifications`, `/settings` | `ProfilePage.tsx:25-26`, мёртвый `DesktopNav.tsx:66` | только из «кабинета» |
| `/login`, `/register` | `ProfilePage.tsx:38,41`, друг из друга | только из «кабинета» |
| `/profile` | `layout/BottomNav.tsx:18` (мобильный) | **только мобильный**, на десктопе входа нет |
| `/services` | `Footer.tsx:12` («Все услуги»), `layout/BottomNav.tsx:16` | ок |
| `/services/web`, `ai-assistant`, `telegram`, `ai-video`, `consulting` | `src/data/solutions.ts:36-89` → `SolutionGrid` (главная и `/services`) | ок |
| `/products/*` (3 живых), `/cases`, `/blog`, `/contact` | `MainNav.tsx:11-16`, `Footer.tsx:9-11,62-65` | ок |
| `/privacy`, `/offer` | `Footer.tsx:110,117`, формы | ок |

Сломанный путь в навигации: `layout/BottomNav.tsx:16` содержит `path: "/brief"`. Роута нет, но пункт с `accent: true` вызывает `open()` (`:23-27`) и 404 не выдаёт.

### 1.4 Мёртвый код (файлы не подключены)

- **Страницы:**
  - `src/pages/admin/AdminCrmPage.tsx` (422 строки)
  - `src/pages/admin/AdminRoot.tsx`
  - `src/pages/admin/AdminCmsShell.tsx` (импорт есть, в JSX не используется)
  - `src/pages/legal/PrivacyPage.tsx`, `OfferPage.tsx`, `CookiesPage.tsx` (дубли `src/routes/*`)
- **Навигация:**
  - `src/components/BottomNav.tsx`, `src/components/DesktopNav.tsx` (старые)
  - `src/components/layout/Header.tsx`, `src/components/layout/MobileHeader.tsx`
  - `src/components/SearchOverlay.tsx` и `src/components/BrandLogo.tsx` — используются только в этих мёртвых навигациях
- **Главная:**
  - `src/components/home/HomeHero.tsx` (импорт закомментирован в `CmsHomePage.tsx:6`)
  - `src/components/home/HomePlans.tsx`
  - функция `HomeIncluded` и массив `INCLUDED` в `CmsHomePage.tsx:19-72`: объявлены, но не рендерятся
- **Бэкенд:**
  - `server/chat-queue.mjs`, `server/chat-worker.mjs`, `server/redis-connection.mjs` — не импортируются в `cms-server.mjs`
  - дубли роутов `GET /settings` (`:5034`) и `PATCH /settings/:key` (`:5048`): Express берёт первые (`:1891`, `:1900`), вторые недостижимы

---

## РАЗДЕЛ 2 — Откуда берётся контент публичных страниц

**Обозначения:**
- **ХК** — хардкод в компоненте
- **DATA** — `src/data/*`
- **API** — эндпоинт → обработчик → таблица
- **CMS** — раздел админки

Контакты (email `neeklostudio@gmail.com`, Telegram `@neeekn`) заданы в одном месте, `src/constants/index.ts:1-3`. Их используют `Footer`, `ContactPage`, `ServicesPage`, `privacy`, `offer`, `cookies`, `ServiceCTA`, `QuickLeadForm`, `SuccessScreen`, `TelegramManagerButton`, `KpShowcasePage`, `KpSlugPage`, `CmsHomePage`.

### 2.1 Главная `/`
Подробно — в §5. Кратко: всё ХК/DATA, кроме блока кейсов (API `/cases` ← `/admin/cases`).

### 2.2 Кейсы `/cases` — `src/pages/CasesPage.tsx`

**Кейсы — API + CMS:**
- Запрос `fetch("/cms-api/cases")` (`:71`) → `server/cms-server.mjs:4360` → таблица `cases` (`isActive=true`, сортировка `sortOrder`).
- Редактируется в **`/admin/cases`** (`AdminCasesPage.tsx` → `/admin/cases` `:4373-4427`, картинки через `POST /media/upload` `:1777` → `cms_media`).
- Если API упал — пустой список, фолбэка нет.

**Фильтр по услугам — DATA:** `src/data/serviceTags.ts` (`CASE_SERVICE_TAGS`), привязка по `slug` кейса. Новый кейс без записи в `serviceTags.ts` не попадёт ни в один фильтр услуг.

**Вкладка «Видео» — сломана:**
- `fetch("/cms-api/videos")` (`:76`) → 301-редирект (`express.static` на `public/videos`, `server/cms-server.mjs:202`) → не JSON → пусто.
- `fetch("/cms-api/video-categories")` (`:81`) → 404.
- `/admin/videos` тоже не работает (К3). На проде 22 кейса, видео 0.

**Тексты, табы, SEO — ХК:** `:13`, `usePageMeta`.

### 2.3 Блог `/blog`, `/blog/:slug`

- **`BlogPage.tsx`:** `fetch("/cms-api/blog")` (`:18`) даёт 404, поэтому всегда показывается **DATA** `src/data/news.ts` (`news`, 5 статей, `:12-65`).
- **`BlogPostPage.tsx`:** только **DATA** `src/data/news.ts`, тексты статей — там же/ХК.
- Через админку сейчас **не редактируется**: `/admin/blog` получает 404.

### 2.4 Услуги

| Страница | Источник |
|---|---|
| `/services` `ServicesPage.tsx` | ХК (заголовки, контакты `:69-78`) + `SolutionGrid` ← **DATA** `src/data/solutions.ts` (`solutions`) + `useBrief` (визард, К2) |
| `/services/web`, `ai-video`, `ai-assistant`, `telegram`, `education` | Шаблон из `src/components/services/*` (Hero, ForWhom, Delivers, Case, Packages, Process, FAQ, RelatedCases, CTA), `src/styles/services.css`. Все тексты и цены — **DATA** `src/data/services/{web,aiVideo,aiAssistant,telegram,education}.ts` (`hero`, `heroPkgs`, `forWhom`, `delivers`, `caseData`, `packages`, `process`, `faq`). |
| — блок «Наши работы» | `ServiceRelatedCases.tsx:3,12` ← **DATA** `src/data/cases.ts` (не БД) + `src/data/serviceTags.ts` |
| `/services/consulting` | ХК в `ServiceConsulting.tsx` (пакеты, шаги, FAQ) + `QuickLeadForm source="consulting"` (`:257`) |
| `/services/:slug` (legacy) | ХК `ServiceDetailPage.tsx:26-92` + ключи переводов `sdet.*` в `src/hooks/useLanguage.tsx` |

### 2.5 Продукты (главное меню)

| Страница | Источник |
|---|---|
| `/products/websites` | ХК весь файл `WebsitesPage.tsx` (409 строк), SEO `:203` |
| `/products/ai-agents` | ХК `AIAgentsPage.tsx` (330 строк) |
| `/products/video` | ХК `VideoPage.tsx` (349 строк) |
| `/products/:slug` | DATA `src/data/products.ts` (`products`, `getProduct` `:166`) — фактически не показывается |

### 2.6 Остальные публичные страницы

| Страница | Источник |
|---|---|
| `/contact` | ХК `ContactPage.tsx` (190 строк, включая имя основателя в SEO `:9`) + `src/constants` |
| `/privacy`, `/offer`, `/cookies` | ХК `src/routes/privacy.tsx` (111), `offer.tsx` (133), `cookies.tsx` (94) |
| `/legal/:slug` | CMS: `cmsPageBySlug("legal")` (`LegalPage.tsx:27`) → `GET /pages/slug/:slug` (`server/cms-server.mjs:1515`) → `cms_pages`, парсер `src/lib/cms-parsers.ts` (`parseLegalDocs`). Редактор **`/admin/pages`**. |
| `/works` | CMS `cmsPageBySlug("works")` (`WorksPage.tsx:117`) → `cms_pages`, `parseWorksGrid` + DATA `src/data/cases.ts`, `serviceTags.ts`. Редактор `/admin/pages`. |
| `/projects` | CMS `cmsPageBySlug("projects")` (`ProjectsPage.tsx:81`) → `cms_pages`, `parseProjectsCms`. Редактор `/admin/pages`. |
| `/projects/:id`, `/notifications`, `/manager-chat`, `/order/:id`, `/profile`, `/settings`, `/login`, `/register` | ХК/моки внутри файлов, API нет |
| `/chat` | API `GET /chat/bootstrap` (`:1456`, CMS-страница `chat` → заголовки/приветствие) + `POST /chat` (`:2862`) → `crm_chats`, `crm_leads`, `prototype_jobs`, ассистент из `cms_assistants` (Qdrant RAG). Настраивается в `/admin/pages` (страница `chat`), `/admin/assistants`, `/admin/knowledge`, `/admin/settings` (`public.chat.default_assistant_id`). |
| `/kp` | API `GET /settings/public` → ключ `kp.showcase` (`KpShowcasePage.tsx:120-122`), фолбэк ХК `DEFAULT_SHOWCASE` (`:27`). Правится в `/admin/settings` (ключ `kp.showcase`, `is_public=true`). |
| `/kp/:slug` | API `GET /api/kp/:slug` (`:4239`) → `commercial_offers`. Создаётся только через API `POST/PUT /api/kp` (`:4259`, `:4297`), **UI в админке нет**. |
| 404 | ХК `NotFound.tsx` |

### 2.7 Глобальные элементы

| Элемент | Файл | Источник |
|---|---|---|
| Шапка | `src/components/layout/MainNav.tsx` | ХК `NAV_LINKS` `:10-17` (логотип-компонент внутри файла, `ThemeToggle`) |
| Нижнее меню (мобильный) | `src/components/layout/BottomNav.tsx` | ХК `ITEMS` `:13-19`, подписи из `useLanguage` (`nav.*`) |
| Липкая плашка | `src/components/layout/StickyCTA.tsx` | ХК, скрыта на `HIDE_PREFIXES` `:6`, форма `QuickLeadForm source="sticky-cta"` `:85` |
| Навигатор секций главной | `src/components/layout/SeriesRail.tsx` | ХК `RAIL_ITEMS` `:9-16` (id секций!) |
| Футер | `src/components/Footer.tsx` | ХК `SERVICES` `:8-13`, ссылки `:62-65,110,117` + `src/constants` |
| Кнопка Telegram | `src/components/TelegramManagerButton.tsx` | ХК + `TELEGRAM_URL` |
| Cookie-баннер | `src/components/CookieBanner.tsx` | ХК, localStorage `neeklo_cookie` |
| Визард брифа | `src/components/BriefWizard.tsx` | DATA `src/data/homeData.ts` (`SOLUTIONS`, `BUDGET_OPTIONS`), **отправки нет** (К2) |
| Переводы RU/EN | `src/hooks/useLanguage.tsx` (354 строки) | ХК словарь |
| SEO по страницам | `src/hooks/usePageMeta.ts` / `usePageTitle.ts` — вызовы в каждой странице | ХК |
| SEO по умолчанию, OG | `index.html` | ХК (og:image устаревший, см. память проекта) |
| `sitemap`, `robots`, редиректы | `public/sitemap.xml`, `public/robots.txt`, `public/_redirects` | ХК |
| Логотип из админки | `src/components/BrandLogo.tsx` ← `public.brand.logo_url` | **не показывается**: компонент используется только в мёртвых навигациях |

### 2.8 Сводка: что меняется через админку

| Страница / блок | Через админку? | Что можно в админке | Что только кодом |
|---|---|---|---|
| Главная `/` | **частично** | карточки кейсов (`/admin/cases`) | всё остальное: `HeroNew.tsx`, `src/data/solutions.ts`, `HomeProcess.tsx`, `src/data/news.ts`, `HomeStats.tsx`, `HomeFinalCTA.tsx` |
| `/cases` | **да** (кейсы) | кейсы, обложки, порядок, активность | привязка к услугам `src/data/serviceTags.ts`; видео сломаны |
| `/blog`, `/blog/:slug` | **нет** | — (раздел сломан) | `src/data/news.ts` |
| `/services` | нет | — | `ServicesPage.tsx`, `src/data/solutions.ts` |
| `/services/{web,ai-video,ai-assistant,telegram,education}` | нет | — | `src/data/services/*.ts`, `src/data/cases.ts` |
| `/services/consulting` | нет | — | `ServiceConsulting.tsx` |
| `/products/{websites,ai-agents,video}` | нет | — | соответствующие файлы в `src/pages/products/` |
| `/contact`, `/privacy`, `/offer`, `/cookies` | нет | — | файлы страниц + `src/constants/index.ts` |
| `/works`, `/projects`, `/legal/:slug` (legacy) | да | CMS-страницы `works`/`projects`/`legal` в `/admin/pages` | — |
| `/chat` | да | тексты (страница `chat`), ассистент, база знаний | UI `ChatPage.tsx` |
| `/kp` | да | ключ `kp.showcase` в `/admin/settings` | — |
| `/kp/:slug` | через API | КП в `commercial_offers` (UI нет) | шаблон `src/components/kp/*` |
| Шапка / футер / меню | нет | — | `MainNav.tsx`, `Footer.tsx`, `BottomNav.tsx` |
| Логотип | нет (сохраняется, но не отображается) | `/admin/branding` | `MainNav.tsx` |

---

## РАЗДЕЛ 3 — Админ-панель

**Авторизация:**
1. `POST /auth/login` (`server/cms-server.mjs:1074`) проверяет `app_users` (bcrypt) и выдаёт JWT.
2. Токен хранится в `localStorage` под ключом `neeklo_admin_jwt` (`src/lib/auth-token.ts:1`).
3. `src/lib/admin-api.ts` (axios, база `/cms-api`) подставляет `Bearer`. На 401 — редирект на `/admin/login` (`:27`).
4. Guard `AdminAuthGuard.tsx` → `GET /auth/me` (`:1146`).
5. Серверные мидлвары: `requireAuth` (`:532`), `requireAdmin` (`:547`).
6. `POST /auth/register` (`:1096`) создаёт ADMIN только при пустой `app_users`, иначе 403.

**Легенда колонки «На сайте»:**
- ✅ отражается на публичном сайте
- ⚙️ внутреннее (CRM/AI/боты — сайт не показывает, но бэкенд использует)
- ❌ в никуда
- 💥 сломан (эндпоинта нет, 404)

| Раздел | Файл | Что редактирует | Эндпоинты → обработчик | Таблица / хранилище | На сайте |
|---|---|---|---|---|---|
| Дашборд `/admin` | `AdminDashboardPage.tsx` | сводка | `GET /admin/stats` → **нет** | — | 💥 |
| Лиды+чаты `/admin/kanban` | `src/pages/AdminPage.tsx` | лиды, статусы, чаты сайта | `GET/POST /crm/leads` (`:3274`, `:3317`), `PATCH /crm/leads/:id` (`:3346`), `GET /crm/chats` (`:3376`), `GET /crm/chats/:id` (`:3412`), `POST /crm/chats/:id/messages` (`:3491`) | `crm_leads`, `crm_chats` | ⚙️ сюда падают `QuickLeadForm` и `/chat` |
| Оператор `/admin/operator` | `AdminOperatorPage.tsx` | ответы в чатах, перехват | `GET /crm/chats*`, `POST /crm/chats/:id/messages`, `connect-operator` (`:3513`) | `crm_chats` | ⚙️ |
| Avito `/admin/avito/:section` | `AdminAvitoPage.tsx` (992 строки) | аккаунты, токены, вебхук, объявления, чаты, события | `/avito/*` (`:3542-3844`), `PATCH /settings/agent.avito_enabled`, `POST /admin/knowledge/sync-avito-items` (`:4812`) | `cms_settings` (`integrations.avito*`), Avito API, Qdrant | ⚙️ см. §4 |
| Кейсы `/admin/cases` | `AdminCasesPage.tsx` | кейсы | `GET/POST/PUT/DELETE /admin/cases` (`:4373-4427`), `POST /media/upload` (`:1777`) | `cases`, `cms_media` | ✅ `HomeCases.tsx:56`, `CasesPage.tsx:71` |
| Видео `/admin/videos` | `AdminVideosPage.tsx` | видео, категории | `/admin/videos`, `/admin/video-categories`, `/admin/upload-video` → **нет** | (`case_videos`, `video_categories` — без API) | 💥 (сайт тоже ждёт `CasesPage.tsx:76,81`) |
| Блог `/admin/blog` | `AdminBlogPage.tsx` | статьи | `/admin/blog*` → **нет** | (`blog_posts` — без API) | 💥 (сайт ждёт `BlogPage.tsx:18`, показывает `news.ts`) |
| Страницы сайта `/admin/site-pages` | `AdminSitePagesPage.tsx` | тексты главной/контактов/услуг | `GET /settings/public` (`:1156`), `PATCH /settings/:key` (`:1900`) | `cms_settings` (`page.*`, `isPublic=false`) | ❌ (К7) |
| CMS-страницы `/admin/pages`, `/admin/pages/:id` | `AdminPagesList.tsx`, `AdminPageEditor.tsx` + `src/components/admin/page-builder/*` | блоки страниц, версии | `/pages*` (`:1501-1739`), валидация `server/block-schemas.mjs` / `src/lib/block-schemas.ts` | `cms_pages`, `cms_page_versions`, `cms_media_usage` | ✅ только для `works`, `projects`, `legal`, `chat`. Страница `home` — ❌ (главная хардкод). Нет в сайдбаре. |
| Медиа `/admin/media` | `AdminMediaPage.tsx` | файлы | `GET /media` (`:1750`), `POST /media/upload` (`:1777`), `DELETE /media/:id` (`:1867`) | `cms_media`, `cms_media_usage`, диск `public/uploads` | ✅ косвенно (обложки кейсов, CMS-страницы) |
| Брендинг `/admin/branding` | `AdminBrandingPage.tsx` | логотипы | `GET /settings`, `PATCH /settings/:key` | `cms_settings` (`public.brand.logo_url`, `public.brand.logo_white_url`) | ❌ (`BrandLogo.tsx` только в мёртвых навигациях). Нет в сайдбаре. |
| Ассистенты `/admin/assistants`, `/:id` | `AdminAssistantsPage.tsx`, `AdminAssistantEditor.tsx` | промпты, модели, ключи | `/assistants*` (`:1922-2085`) | `cms_assistants` | ⚙️ питает `/chat` |
| Знания ассистента `/admin/knowledge`, `/knowledge/graph` | `AdminKnowledgePage.tsx`, `AdminKnowledgeGraphPage.tsx`, `src/services/ai.service.ts` | RAG-чанки, граф | `/assistants/:id/knowledge/*`, `/rag/*` (`:2113-2583`) | Qdrant (коллекции по ассистенту), `cms_assistants` | ⚙️ питает `/chat` |
| AI-аналитика `/admin/ai-analytics` | `AdminAiAnalyticsPage.tsx` | отчёт | `GET /crm/analytics` (`:3248`) | `crm_chats`, `crm_leads` | ⚙️ только чтение |
| Биллинг `/admin/billing` | `AdminBillingPage.tsx` | API-ключи, расходы | `GET /billing/overview` (`:3153`), `PATCH /billing/keys/:id` (`:3219`) | `billing_api_keys`, `billing_usage_logs` | ⚙️ |
| База знаний (статьи) `/admin/knowledge-base` | `AdminKnowledgeBasePage.tsx` | статьи | `/admin/knowledge-articles*` → **нет** | (`knowledge_articles`) | 💥 |
| Регламенты `/admin/regulations` | `AdminRegulationsPage.tsx` | регламенты | `/admin/regulations*` → **нет** | (`regulations`) | 💥 |
| CRM-дашборд `/admin/crm` | `AdminCrmDashboard.tsx` | сводка | `/admin/crm/stats`, `/admin/crm/contacts` → **нет** | — | 💥 |
| Контакты `/admin/crm/contacts` | `AdminContactsPage.tsx` | контакты | `/admin/crm/contacts*` → **нет** | (`crm_contacts`, `crm_activities`) | 💥 |
| Проекты `/admin/crm/kanban` | `AdminCrmKanbanPage.tsx` | сделки | `/admin/crm/deals*` → **нет** | (`crm_deals`) | 💥 |
| Настройки `/admin/settings`, `/item/:key` | `AdminSettingsPage.tsx`, `AdminSettingEditor.tsx` | любой ключ `cms_settings` + флаг публичности | `GET /settings` (`:1891`), `PATCH /settings/:key` (`:1900`) | `cms_settings` | ✅ для публичных ключей (`kp.showcase`, `public.chat.default_assistant_id`); ⚙️ для остальных |
| Telegram-бот `/admin/telegram` | `AdminTelegramPage.tsx` | доступ админов к боту, вебхук, тест | `/tg/*` (`:4453-4524`) | `cms_settings` (`tg.admin_requests`, `tg.approved_chats`), Telegram API | ⚙️ уведомления о лидах и Avito |
| Агент `/admin/ai-agent` | `AdminAiAgentPage.tsx` | вкл/выкл Avito-агента, системный промпт, баланс | `/ai-agent/*` (`:4540-4590`), `PATCH /settings/agent.avito_enabled`, `agent.avito_system_prompt` | `cms_settings`, внешний `crm-al.neeklo.ru` | ⚙️ Avito |
| Глобальная база знаний `/admin/global-knowledge` | `AdminGlobalKnowledgePage.tsx` | чанки для Avito-агента | `/admin/knowledge/*` (`:4699-4812`) | Qdrant | ⚙️ Avito-агент |
| Прайс `/admin/pricing` | `AdminPricingPage.tsx` | цены услуг | `/admin/prices*` (`:4608-4682`) + `upsertPriceToKb` (Qdrant) | `service_prices` (К4) | ⚙️ читают Avito-агент (`:4045`) и тест-чат (`:4861`). Публичный `GET /prices` (`:4620`) фронтенд **не использует**, цены на сайте — хардкод в `src/data/services/*.ts`. |
| Тест-чат `/admin/test-chat` | `AdminTestChatPage.tsx` | проверка агента | `/admin/test-chat/*` (`:4861-4961`) | `cms_settings` (история), `service_prices` | ⚙️ |

**Дубли и пересечения:**
- **`/admin/kanban` (`src/pages/AdminPage.tsx`) и `/admin/crm/kanban`.** Разные сущности: лиды `crm_leads` (работает) и сделки `crm_deals` (сломан). В сайдбаре только сломанный «Проекты».
- **`/admin/site-pages` и `/admin/pages`.** Две «CMS». Первая пишет в никуда, вторая работает только для legacy-страниц.
- **Три «базы знаний»:**
  - `/admin/knowledge` — RAG ассистентов, работает
  - `/admin/global-knowledge` — RAG Avito, работает
  - `/admin/knowledge-base` — статьи, сломан
- **Чаты в трёх местах:** `/admin/kanban`, `/admin/operator`, `/admin/avito/chats`; плюс битая ссылка `/admin/chats`.
- **Мёртвый файл** `AdminCrmPage.tsx` дублирует `AdminPage.tsx`.

**Бэкенд-эндпоинты без UI:**
- `POST/PUT/DELETE /api/kp*` (`:4259-4336`)
- `POST /avito/analyze-conversation` (`:4979`), `GET /admin/knowledge/insights` (`:5001`)
- `POST /avito/token-refresh` (`:3620`), `PUT /avito/items/:itemId/vas` (`:3683`), `POST /avito/clero/sync-all` (`:3844`)
- `/ai-agent/usage`, `/ai-agent/usage/daily`, `POST /ai-agent/chat` (`:4560-4590`)
- `POST /auth/users` (`:1129`), `GET /pages/:id/versions*` (используется редактором)
- `GET /deploy/status` (`:1057`, публичный), **`POST /internal/deploy` (`:1061`, К1)**

---

## РАЗДЕЛ 4 — Avito-интеграция (+ Telegram и AI-агент)

> **Граница:** всё ниже — «чужая территория». Задача по сайту не должна менять ни одну строку из этого раздела.

### 4.1 Файлы

| Файл | Роль |
|---|---|
| `server/cms-server.mjs:571-1050` | конфиг Avito, токены, API-клиент, подпись, парсинг вебхука, запись в CRM, `sendTelegramNotification` |
| `server/cms-server.mjs:3535-3853` | admin-роуты `/avito/*` |
| `server/cms-server.mjs:3918-3934` | прокси в Clero |
| `server/cms-server.mjs:3937-4197` | обработка входящего вебхука (`handleAvitoIncomingWebhook`), автоответ агента |
| `server/cms-server.mjs:4442-4538` | Telegram-роуты `/tg/*` |
| `server/cms-server.mjs:4540-4600` | `/ai-agent/*` |
| `server/cms-server.mjs:4608-4700` | прайс → Qdrant |
| `server/cms-server.mjs:4699-4860` | глобальная база знаний |
| `server/cms-server.mjs:4861-5030` | тест-чат, анализ диалога |
| `server/services/avito-agent.mjs` (459 строк) | `buildAgentContext` (`:104`), `processAvitoMessage` (`:197`), `detectLeadIntent` (`:223`), `analyzeConversationToKb` (`:263`), `upsertAvitoItemToKb` (`:319`), `upsertPriceToKb` (`:374`), `upsertGlobalKbChunk` (`:415`), `extractPhone` (`:438`), `detectTransferIntent` (`:450`) |
| `server/services/ai-chat.service.mjs`, `openrouter.service.mjs`, `crm-al.service.mjs`, `ai.service.mjs` | LLM (OpenRouter / crm-al), эмбеддинги, Qdrant |
| `server/telegram-bot.mjs` (391 строка) | бот: `sendTgMessage` (`:27`, IPv4 + 3 попытки), `notifyAll` (`:205`), `notifyNewLead` (`:224`), `notifyNewAvitoMessage` (`:233`, дедуп 180 с), `notifyAgentError`/`Reply`/`ClientContact`/`TransferIntent`/`LeadCreatedFromAvito` (`:279-326`), `handleTgUpdate` (`:341`) |
| `server/clero-helpers.mjs` | `CLERO_ENDPOINT`, `buildCleroPayload`, `isClientAvitoMessage`, `sendToCleroRaw` |
| Фронтенд | `src/pages/admin/AdminAvitoPage.tsx`, `AdminAiAgentPage.tsx`, `AdminGlobalKnowledgePage.tsx`, `AdminPricingPage.tsx`, `AdminTestChatPage.tsx`, `AdminTelegramPage.tsx`, `AdminOperatorPage.tsx`, `src/lib/crm-chat-messages.ts` |
| nginx | locations `/avito/`, `/incoming/`, `/api/clero/`, `/tg/` в `/etc/nginx/sites-enabled/neeklo.ru` |

### 4.2 Эндпоинты

| Метод | Путь | Строка | Кто вызывает | Авторизация |
|---|---|---|---|---|
| POST | `/avito/webhook/:agentId`, `/incoming/:agentId` | 4196-4197 → `handleAvitoIncomingWebhook` `:3953` | **Avito** (вебхук мессенджера) | подпись HMAC (см. К6) |
| GET | `/avito/webhook/:agentId`, `/incoming/:agentId` | 3535-3541 | проверка доступности | нет |
| POST | `/api/clero/avito-webhook` | 3918 | loopback из `sendToClero` → прокси на `https://clero.so/api/v1/integrations/api-chat/message/` | нет (токен в теле) |
| GET/PUT | `/avito/config` | 3542, 3551 | админка | JWT |
| GET | `/avito/events` | 3560 | админка | JWT |
| POST | `/avito/messenger/register-webhook` | 3570 | админка → Avito API | JWT |
| GET | `/avito/webhook-status` | 3595 | админка | JWT |
| POST/GET | `/avito/token-refresh`, `/avito/token-check` | 3620, 3633 | админка | JWT |
| GET | `/avito/items`, `/avito/items/:itemId` | 3646, 3665 | админка | JWT |
| PUT | `/avito/items/:itemId/vas` | 3683 | — (платные услуги Avito!) | JWT |
| GET | `/avito/messenger/chats`, `/:chatId/messages` | 3702, 3721 | админка | JWT |
| POST | `/avito/messenger/chats/:chatId/messages` | 3741 | админка (ответ оператора в Avito) | JWT |
| GET | `/avito/messenger/chats/:chatId/agent-status` | 3761 | админка | JWT |
| POST | `/avito/messenger/chats/:chatId/pause-agent`, `resume-agent` | 3779, 3789 | админка | JWT |
| POST | `/avito/sync`, `/avito/clero/sync-all` | 3798, 3844 | админка | JWT |
| POST | `/avito/analyze-conversation` | 4979 | — | JWT |
| POST | `/admin/knowledge/sync-avito-items` | 4812 | админка | JWT |
| POST | `/tg/webhook` | 4442 | **Telegram** | нет (нет `secret_token`) |
| POST/GET | `/tg/setup-webhook`, `/tg/webhook-info` | 4453, 4464 | админка | JWT |
| GET/POST/DELETE | `/tg/admin-requests*`, `/tg/approved-chats`, `/tg/notify` | 4474-4524 | админка | JWT |
| GET/POST | `/ai-agent/balance`, `models`, `usage`, `usage/daily`, `status`, `chat` | 4540-4590 | админка | JWT |

### 4.3 Данные

**Таблицы:**
- **`crm_chats`** (`Chat`) — переписка Avito хранится JSON-массивом `messages`. Элементы с `source: "avito"` / `"avito_agent"`, флаги паузы/перехвата оператора.
- **`crm_leads`** (`Lead`) — лиды, созданные агентом (`source: "avito"`, `:4120-4131`).
- **`service_prices`** — контекст цен для агента (`:4045`).

**Ключи `cms_settings`:**

| Ключ | Что хранит |
|---|---|
| `integrations.avito` (`:571`) | аккаунты: `clientId`, `clientSecret`, `accessToken`, `refreshToken`, `tokenExpiresAt`, `webhookSecret`, `webhookBaseUrl`, `agentBindings`, `telegramBotToken`, `telegramChatId`, `telegramEnabled` |
| `integrations.avito.chat_map` (`:572`) | Avito chatId → CRM chatId |
| `integrations.avito.events` (`:573`) | лог последних 500 событий |
| `integrations.avito.clero_sent` (`server/clero-helpers.mjs:5`) | какие чаты уже отправлены в Clero |
| `agent.avito_enabled`, `agent.avito_system_prompt` | включение и промпт агента |
| `tg.admin_requests`, `tg.approved_chats` (`server/telegram-bot.mjs:22-23`) | доступ к боту |
| история тест-чата | ключ в `cms_settings` (`:4951`) |

**Состояние в памяти** (пропадает при `pm2 restart`):
- `_avitoTgNotifyDedup` (`:3937`) — дедуп уведомлений
- throttle в `telegram-bot.mjs` (`_isThrottled`)
- `markAgentOutgoing` / `isRecentAgentOutgoing` (`:777-792`) — защита от эха своих ответов

После рестарта в первые минуты возможны дубли уведомлений или повторная обработка ретраев Avito.

**Лог-файлы:** `AVITO_LOG_DIR` (`writeAvitoLogLine` `:1042`).

**Qdrant:** коллекции глобальной базы знаний, объявлений Avito и прайса (`server/services/avito-agent.mjs:319-437`).

### 4.4 Внешние вызовы

| Сервис | URL | Где |
|---|---|---|
| Avito API (OAuth, messenger v1/v3, items) | `https://api.avito.ru` | `server/cms-server.mjs:574`, `refreshAvitoToken` `:646`, `avitoApiRequest` `:820`, `avitoSendChatMessage` `:768` |
| Telegram Bot API | `https://api.telegram.org/bot…` | `server/telegram-bot.mjs:20`, `server/cms-server.mjs:954-970` (legacy-отправка через конфиг Avito) |
| Clero CRM | `https://clero.so/api/v1/integrations/api-chat/message/` | `server/cms-server.mjs:3921`, `server/clero-helpers.mjs:4` |
| LLM | `https://openrouter.ai/api/v1` (`server/services/openrouter.service.mjs:6`), `https://crm-al.neeklo.ru` (`server/services/crm-al.service.mjs:2`), `https://api.openai.com/v1` (`server/cms-server.mjs:2087`) | |
| Эмбеддинги / Ollama | `OLLAMA_URL` (по умолчанию `127.0.0.1:11434`), жёстко прописан `http://188.124.55.89` в `server/services/ai.service.mjs:32` | |
| Qdrant | `QDRANT_URL` (по умолчанию `127.0.0.1:6333`) | |
| Фолбэк вебхука | `https://site-al.ru/api/incoming` (`server/cms-server.mjs:746`), если не задан ни конфиг, ни env | |

### 4.5 Конфиг

- **Переменные окружения** (только имена):
  - Avito: `AVITO_WEBHOOK_SECRET`, `AVITO_AGENT_ENABLED`, `AVITO_INCOMING_WEBHOOK_BASE`, `PUBLIC_WEBHOOK_BASE`, `AVITO_LOG_DIR`, `NIKITA_AVITO_AUTHOR_ID`
  - Telegram: `TG_BOT_TOKEN`
  - Clero: `CLEROAPITOKEN`, `CLERO_ENDPOINT`, `CLERO_SOURCE_ID`
  - LLM и поиск: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODEL`, `CRM_AL_BASE_URL`, `CRM_AL_API_KEY`, `CRM_AL_DEFAULT_MODEL`, `OPENAI_API_KEY`, `OLLAMA_URL`, `QDRANT_URL`, `QDRANT_API_KEY`
  - Прочее: `REDIS_URL` (не используется), `APP_BASE_URL`, `PUBLIC_SITE_BASE`, `JWT_SECRET`
- **Где лежат:** `/var/www/neeklo.ru/.env` на сервере (не в git). PM2 грузит его через `ecosystem.config.cjs` (`dotenv`, `max_memory_restart: 400M`).
- **Остальной конфиг** — в `cms_settings`, правится в `/admin/avito/config`, `/admin/ai-agent`, `/admin/telegram`.

### 4.6 Поток входящего сообщения Avito

1. Avito → `POST https://neeklo.ru/avito/webhook/:agentId` → nginx → `handleAvitoIncomingWebhook` (`:3953`).
2. Загрузка `integrations.avito`, поиск аккаунта по `agentBindings`, проверка HMAC (`:3957-3967`). Отказ → событие `webhook_rejected` + 401.
3. `extractAvitoWebhookMessage` (`:899`) → `claimAvitoTgNotify` (дедуп **до** первого await, `:3974`) → `ingestAvitoMessageToCrm` (`:988`): запись в `crm_chats` + `chat_map`, эхо своих ответов помечается `duplicate`.
4. Если не дубль → `notifyNewAvitoMessage` в Telegram всем одобренным чатам (`:3977-3991`), с пометкой, что агент выключен. По телефону в тексте → `notifyClientContact`, по намерению передать менеджеру → `notifyTransferIntent` (`:3995-4002`).
5. Если автор — клиент (`isClientAvitoMessage`, не `NIKITA_AVITO_AUTHOR_ID`):
   - проверка `agent.avito_enabled` (выключен → выход, `:4009-4015`) и перехвата оператором (`:4025-4029`);
   - сбор истории чата, промпта `agent.avito_system_prompt`, цен из `service_prices` (`:4045`);
   - `processAvitoMessage` (LLM + RAG);
   - отправка ответа в Avito `avitoSendChatMessage` (`:4086`) → `appendMessageToChat` → `notifyAgentReply`;
   - `detectLeadIntent` → при контакте создаётся `crm_leads` + `notifyLeadCreatedFromAvito` (`:4112-4145`);
   - ошибки → `notifyAgentError`.
6. Первое клиентское сообщение чата пересылается в Clero один раз (`:4165-4185`): `sendToClero` → loopback `/api/clero/avito-webhook` → clero.so.

### 4.7 Что сломается, если задеть

| Действие | Последствие |
|---|---|
| Переименовать/убрать nginx location `/avito/`, `/incoming/`, `/api/clero/`, `/tg/` или поменять префикс `/cms-api/` | Вебхуки Avito и Telegram перестанут доходить молча. Avito в итоге отключит вебхук. |
| Изменить `ingestAvitoMessageToCrm` / `appendMessageToChat` / `parseChatMessagesJson` | Дубли сообщений, агент отвечает сам себе (эхо), ломается перехват оператором. |
| Изменить модель `Chat` (`crm_chats`) или `Lead` (`crm_leads`) в `prisma/schema.prisma` | Падает весь поток Avito, `/chat` сайта и `QuickLeadForm`. |
| Трогать `service_prices` (включая «починку» К4) | Агент теряет контекст цен или отвечает неверными ценами. При неудачной смене PK таблица может остаться без первичного ключа. |
| `pm2 restart neeklo-api` / деплой | Сбрасываются дедуп-карты: возможны дубли Telegram-уведомлений на ретраях Avito. |
| Поменять `JWT_SECRET` | Разлогинятся все админы (не Avito). |
| Удалить/переписать `.env` (`TG_BOT_TOKEN`, `OPENROUTER_API_KEY`, `CRM_AL_*`, `CLEROAPITOKEN`) | Уведомления, агент и Clero перестают работать. |
| Сохранить конфиг в `/admin/avito/config` с пустыми полями | Затираются токены (`PUT /avito/config` перезаписывает `integrations.avito`). |
| Вызвать `POST /tg/setup-webhook` или `/avito/messenger/register-webhook` с другим base URL | Вебхуки уходят на другой адрес (фолбэк `site-al.ru`!). |
| Переименовать `sendTelegramNotification` / `getAvitoConfig` | Ломаются уведомления о **заявках с сайта** (`/crm/public-lead` берёт Telegram-настройки из конфига Avito, `:2652-2657`). |
| Изменить `server/telegram-bot.mjs` (особенно `sendTgMessage`, `dns.setDefaultResultOrder("ipv4first")`) | На Beget VPS Telegram по IPv6 недоступен, уведомления пропадут. |

### 4.8 Границы — не трогать

- **Файлы целиком:** `server/telegram-bot.mjs`, `server/services/avito-agent.mjs`, `server/services/{ai-chat,openrouter,crm-al,ai}.service.mjs`, `server/clero-helpers.mjs`, `ecosystem.config.cjs`.
- **Участки `server/cms-server.mjs`:** `571-1050`, `2600-2900` (публичный чат/лиды), `3376-3530` (CRM-чаты), `3535-4200` (Avito + Clero), `4440-4600` (TG + AI-агент), `4608-4700` (прайс), `4699-5030` (база знаний, тест-чат).
- **Таблицы:** `crm_chats`, `crm_leads`, `service_prices`, `cms_settings` (ключи `integrations.*`, `agent.*`, `tg.*`).
- **Админка:** `AdminAvitoPage.tsx`, `AdminAiAgentPage.tsx`, `AdminGlobalKnowledgePage.tsx`, `AdminPricingPage.tsx`, `AdminTestChatPage.tsx`, `AdminTelegramPage.tsx`, `AdminOperatorPage.tsx`, `src/pages/AdminPage.tsx`.
- **Общее с сайтом** (правки влияют и на Avito, и на сайт):
  - `POST /crm/public-lead` (`:2627`) ← `src/components/QuickLeadForm.tsx:57`, Telegram через `getAvitoConfig` + `sendTelegramNotification`
  - `POST /chat` (`:2862`) + `persistCrmUserAndLead` (`:2785`) ← `src/pages/ChatPage.tsx`, те же `crm_chats`/`crm_leads`

---

## РАЗДЕЛ 5 — Структура главной страницы

**Цепочка:** `src/pages/Index.tsx` (3 строки) → `src/components/cms/CmsHomePage.tsx`.

Порядок секций **захардкожен** в JSX `CmsHomePage.tsx:107-118`. CMS-страница `home` и `src/lib/cms-blocks.ts` не участвуют.

| № | Компонент | Где рендерится | Что показывает | Данные |
|---|---|---|---|---|
| 0 | `MainNav` | `App.tsx:137` | логотип, 6 ссылок, тема, кнопка Telegram | ХК `src/components/layout/MainNav.tsx:10-17` |
| 0 | `SeriesRail` | `App.tsx:142` (только `/`) | навигатор 01-06 (desktop) / полоса прогресса (mobile) | ХК `src/components/layout/SeriesRail.tsx:9-16`, ищет элементы с id `hero`, `solutions`, `process`, `cases`, `stats`, `cta` |
| 0 | `Onboarding` | `App.tsx:164` | онбординг | фактически выключен: `showOnboarding` всегда `false` (`App.tsx:274`) |
| 1 | `HeroNew` | `CmsHomePage.tsx:108` → `src/components/sections/HeroNew.tsx` (399 строк) | `id="hero"` (`:81`); H1 (`:88`); кнопки «обсудить» (`onOpenWizard` → BriefWizard, К2) и ссылка `/cases` (`:128`); карусель карточек | ХК `CARDS` `:10+`, тексты в JSX |
| 2 | `HomeSolutions` → `SolutionGrid` | `:109` → `src/components/home/HomeSolutions.tsx` (`id="solutions"` `:12`) → `src/components/home/SolutionGrid.tsx` | сетка решений: web, ai-assistant, telegram, ai-video, consulting (боль → решение → результат) | DATA `src/data/solutions.ts` (`solutions` `:24`); заголовок ХК в `HomeSolutions.tsx` |
| 3 | `HomeProcess` | `:110` → `src/components/home/HomeProcess.tsx` (344 строки) | `id="process"` (`:244`); 3 шага в `StickyTabs` (`:286`, `:305`, `:324`); строки прогресса; ссылка `/cases` (`:210`); кнопка визарда | ХК `PROGRESS_ROWS` `:122`, `src/components/ui/StickyTabs.tsx` |
| 4 | `HomeCases` | `:111-113` (обёрнут в `div ref={casesRef}`) → `src/components/home/HomeCases.tsx` (674 строки) | `id="cases"` (`:81`); первые 4 кейса (`:139`); модалка с деталями; ссылка «все» `/cases` (`:116`); кнопка визарда | **API** `fetch("/cms-api/cases")` (`:56`) → `server/cms-server.mjs:4360` → `cases` ← **`/admin/cases`**. При ошибке API секция пустая, фолбэка нет. |
| 5 | `HomeNews` | `:114` → `src/components/home/HomeNews.tsx` | 3 первые статьи (`:12`), ссылки `/blog/:slug` (`:61`), «все» `/blog` (`:34`) | DATA `src/data/news.ts` |
| 6 | `HomeStats` | `:115` → `src/components/home/HomeStats.tsx` (69 строк) | `id="stats"` (`:10`); «О нас», цифры студии | ХК |
| 7 | `HomeFinalCTA` | `:116` → `src/components/home/HomeFinalCTA.tsx` (60 строк) | `id="cta"` (`:13`); заголовок + **форма телефона** | ХК + `QuickLeadForm variant="panel" source="home-final-cta"` (`:54`) → `/crm/public-lead` → `crm_leads` + Telegram ✅ |
| 8 | `Footer` | `:117` → `src/components/Footer.tsx` | бренд, услуги, навигация, документы, тема, кнопка визарда | ХК + `src/constants` |
| 9 | `BottomNav` | `App.tsx:139` (mobile) | 5 пунктов, центральный открывает визард | ХК `src/components/layout/BottomNav.tsx:13-19` |
| 10 | `StickyCTA` | `App.tsx:140` | плашка с `QuickLeadForm variant="bar" source="sticky-cta"` | ХК `src/components/layout/StickyCTA.tsx:85` |
| 11 | `TelegramManagerButton` | `App.tsx:141` | плавающая кнопка Telegram | ХК + `TELEGRAM_URL` |
| 12 | `CookieBanner` | `App.tsx:262` | согласие на cookies | ХК |

**Объявлено, но не рендерится:**
- `HomeIncluded` («Не просто сайт, а система», `CmsHomePage.tsx:26-72`)
- `HomeHero` (`src/components/home/HomeHero.tsx`, закомментирован `:6`, `:107`)
- `HomePlans` (`src/components/home/HomePlans.tsx` ← `src/data/homeData.ts` `PLANS`)

**Мета главной:** `usePageMeta` в `CmsHomePage.tsx:76-91` (title, description, JSON-LD `ProfessionalService`).

**Как переставить или добавить блок:**
1. Порядок меняется перестановкой строк JSX в `CmsHomePage.tsx:107-118`.
2. У каждой секции есть `id`, на него завязан `SeriesRail`. Если меняешь порядок или добавляешь секцию, которую нужно показать в навигаторе, поправь `RAIL_ITEMS` в `src/components/layout/SeriesRail.tsx:9-16`: id, номер, подпись.
3. `scrollToCases` / `casesRef` (`CmsHomePage.tsx:94-98`) объявлены, но нигде не вызываются. Обёртку `div ref={casesRef}` можно переносить вместе с `HomeCases`.
4. Новый блок: создать `src/components/home/HomeXxx.tsx` (принять `lang`, корень `<section id="xxx" style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>`, как в соседних), импортировать в `CmsHomePage.tsx`, вставить в JSX. Готовый кандидат — `HomeIncluded` в том же файле: достаточно вставить `<HomeIncluded lang={lang} />`.
5. Цвета — только CSS-переменные (`--bg`, `--tx`, `--bd`, `--surface`, `--accent-signal`…) из `src/index.css`, иначе ломается тёмная тема.
6. Анимации — `framer-motion` с `whileInView` в каждом блоке. Общей зависимости между секциями нет.

---

## РАЗДЕЛ 6 — Зоны риска

### 6.1 Общие компоненты (правка затрагивает много страниц)

| Файл | Кто использует | Риск |
|---|---|---|
| `src/App.tsx` (`Layout` `:118-145`, `HIDE_NAV_ROUTES` `:116`, порядок `<Route>`) | весь сайт | Порядок роутов важен: `/services/web` должен идти до `/services/:slug`, `/products/websites` — до `/products/:slug`. Иначе живые страницы подменятся legacy. Ошибка в `Layout` роняет всё. |
| `src/context/BriefContext.tsx` + `src/components/BriefWizard.tsx` | `Footer`, `BottomNav`, `HeroNew`, `HomeProcess`, `HomeCases`, `ServicesPage`, `ProductPage` | `useBrief()` бросает исключение вне провайдера (`:29`). Вынос `BriefProvider` из `App.tsx:285` уронит сайт. Логика отправки (К2) — место будущей правки. |
| `src/components/QuickLeadForm.tsx` | `HomeFinalCTA`, `StickyCTA`, `ServiceConsulting` | **Единственный рабочий канал заявок.** Нельзя менять формат тела `{phone, source, page}` и валидацию 11 цифр: сервер ждёт то же (`server/cms-server.mjs:2636-2640`). |
| `src/components/Footer.tsx` | 18 файлов (почти все публичные страницы) | общий низ сайта |
| `src/components/layout/MainNav.tsx`, `BottomNav.tsx`, `StickyCTA.tsx`, `SeriesRail.tsx` | весь сайт / главная | `StickyCTA` фиксированно перекрывает контент. `BottomNav` задаёт нижний отступ, в `CmsHomePage.tsx:104` жёстко `56px`. |
| `src/components/TelegramManagerButton.tsx`, `CookieBanner.tsx`, `ScrollToTop.tsx`, `PageTransition.tsx`, `ErrorBoundary.tsx` | весь сайт | глобальные обёртки |
| `src/components/ui/*` (shadcn, 54 файла), `src/components/ui/StickyTabs.tsx`, `FadeIn.tsx` | `FadeIn` — 8 файлов услуг; `StickyTabs` — `HomeProcess` | изменение API компонента ломает всех потребителей |
| `src/components/services/*` | 5 страниц услуг + консалтинг | правка шаблона меняет все 5 страниц сразу |
| `src/hooks/usePageMeta.ts`, `usePageTitle.ts`, `useLanguage.tsx`, `useTheme.ts` | все страницы | SEO и переводы всего сайта. `useLanguage` — один словарь на 354 строки. |
| `src/lib/cms-api.ts` (`CMS_BASE`, `cmsJson`), `src/lib/admin-api.ts`, `src/lib/auth-token.ts` | весь фронтенд API | смена `CMS_BASE` или `VITE_CMS_API_BASE` ломает все запросы |
| `src/lib/cms-parsers.ts`, `cms-blocks.ts`, `block-schemas.ts` + `server/block-schemas.mjs` | `/works`, `/projects`, `/legal`, редактор CMS | схемы блоков сверяются на сервере при сохранении, рассинхрон — ошибки сохранения |
| `src/index.css`, `tailwind.config.ts`, `src/styles/services.css` | весь сайт | CSS-переменные тем (светлая/тёмная), шрифты Unbounded/Onest |
| `index.html` | весь сайт | SEO, OG, шрифты, `theme-color` |
| `vite.config.ts` | сборка | алиас `@`, выходной `dist` |

### 6.2 Логика лидов и заявок

| Точка входа | Отправка | Сервер | БД | Уведомление |
|---|---|---|---|---|
| `QuickLeadForm` (`src/components/QuickLeadForm.tsx:57`) | `POST /cms-api/crm/public-lead` | `server/cms-server.mjs:2627-2667`, rate-limit по IP | `crm_leads` (`status:new`, `intentLabel=source`) | `sendTelegramNotification(getAvitoConfig())` (`:2652-2657`) — **через конфиг Avito** (`telegramEnabled`/`telegramBotToken`/`telegramChatId`) |
| `BriefWizard` (`src/components/BriefWizard.tsx:89-120`) | **нет** → `sessionStorage` | — | — | — (К2) |
| `OrderPage` (`src/pages/OrderPage.tsx:36`) | **нет** | — | — | — |
| `/chat` (`src/pages/ChatPage.tsx` → `src/lib/cms-api.ts:107,130`) | `POST /chat`, `POST /crm/chat-session` | `:2862`, `:2600`, `persistCrmUserAndLead` `:2785` | `crm_chats`, `crm_leads`, `prototype_jobs` | **нет** (`persistCrmUserAndLead` только создаёт лид; `notifyNewLead` вызывается лишь из админского `POST /crm/leads`, `:3330`) |
| Avito | вебхук | §4.6 | `crm_chats`, `crm_leads` | `telegram-bot.mjs` |
| `ContactPage`, `ServiceCTA`, `TelegramManagerButton`, `SuccessScreen` | прямые ссылки Telegram/email | — | — | — |

### 6.3 Всё, что касается БД

- **`prisma/schema.prisma`.** Любой `db push` идёт по живой базе без миграций (в `prisma/` только `schema.prisma`, `seed.mjs` — upsert админа, `seed-cases.mjs` — кейсы; папки `migrations` нет; seed-скрипты на проде не запускать). Известный дрейф: `service_prices.id` (К4). Перед правкой схемы — `pg_dump` (делает `deploy.sh`, `/var/backups/neeklo.ru/`).
- **`deploy.sh`.** `git reset --hard` (К5), `npm install --include=dev`, атомарная замена `dist`, проверка `DATABASE_URL` на `neeklo_cms`, `pg_dump`, `prisma db push` без `--accept-data-loss`, `pm2 restart neeklo-api`, `nginx -t`.
- **`server/seed-cms-content.mjs`** (634 строки) — перезапись CMS-контента. **Не запускать на проде.**
- **Скрипты** `server/media-cleanup-deleted.mjs`, `server/rebuild-media-usage.mjs`, `scripts/migrate-images-to-media.mjs`, `scripts/server-*.sh` (правка `.env` на сервере: `server-recover-db-env.sh`, `server-dedupe-db-url.sh`, `merge-server-env.sh`), `scripts/fix-beget-env-sqlite.sh`. Меняют данные, файлы или окружение.
- **`POST /internal/deploy`** (К1).
- **`.env`** на сервере не в git (с коммита `fab581d`). На сервере отвязан через `git rm --cached`. Копия: `/var/backups/neeklo.ru/predeploy_2026-09-15_11-44-*`.
- **`ecosystem.config.cjs`.** Грузит `.env` в PM2, `max_memory_restart: 400M` (при утечке API перезапускается и теряет состояние §4.3).

### 6.4 Avito / Telegram
См. §4.7-4.8. Коротко: `server/telegram-bot.mjs`, `server/services/avito-agent.mjs`, `server/clero-helpers.mjs`, `server/cms-server.mjs:571-1050`, `:3535-4200`, `:4440-5030`, nginx locations `/avito/`, `/incoming/`, `/tg/`, `/api/clero/`.

### 6.5 Прочее

| Место | Риск |
|---|---|
| `public/_redirects`, `public/sitemap.xml`, `public/robots.txt` | индексация и SEO. `sitemap` должен совпадать с живыми роутами. |
| `server/cms-server.mjs:202` `express.static(public)` | `public/videos`, `public/uploads` отдаются самим API. Имена папок конфликтуют с API-путями (`/videos` → 301). |
| `public/uploads/` | загруженные медиа (`cms_media`). Удаление ломает обложки кейсов. |
| Серверные правки «на горячую» | `deploy.sh` их сотрёт. Сначала коммит в git. |
| Работа из `~/Documents/.../neeklo-ai-path` | iCloud выгружает файлы `.git` (dataless), git зависает. Рабочий клон — `~/Projects/neeklo-ai-path`. |

---

## РАЗДЕЛ 7 — Что можно менять безопасно

**Общие правила для всех пунктов:**
- не переименовывать экспорты, ключи объектов, `id`, `slug`, `href`/`path`
- сохранять форму объектов (TypeScript проверит при `npm run build`)
- в JSX менять только текст внутри тегов и строковые литералы
- проверка: `npm run build` локально

### 7.1 Статические данные (правка текста безопасна)

| Файл | Что внутри | Где используется | Осторожно с |
|---|---|---|---|
| `src/data/services/web.ts`, `aiVideo.ts`, `aiAssistant.ts`, `telegram.ts`, `education.ts` | тексты, цены, пакеты, шаги, FAQ страниц услуг | только соответствующая страница `src/pages/services/Service*.tsx` | `id` пакетов и якоря (`#packages`, `#cta`) |
| `src/data/solutions.ts` | карточки решений (боль → решение → результат) | `SolutionGrid` (главная + `/services`) | `id`, `href` (`:36-89`) |
| `src/data/news.ts` | 5 статей блога (превью) | `HomeNews`, `BlogPage`, `BlogPostPage` | `slug` и `href` — это URL статей |
| `src/data/cases.ts` | статические кейсы | `ServiceRelatedCases`, `/works` | `tags` (привязка к услугам), `id` |
| `src/data/serviceTags.ts` | подписи услуг, привязка slug кейса → услуги | `CasesPage`, `WorksPage`, `ServiceDetailPage`, `ServiceRelatedCases` | ключи — slug кейсов из БД. **Подписи** менять можно, ключи — нет. |
| `src/data/homeData.ts` | `SOLUTIONS` и `BUDGET_OPTIONS` визарда; `CASES`, `PROCESS_STEPS`, `STATS`, `PLANS` (не рендерятся) | `BriefWizard`, мёртвые `HomeHero`/`HomePlans` | `SOLUTIONS[].id` — это `serviceId` визарда |
| `src/data/products.ts` | legacy-продукты | мёртвый `/products/:slug` | правки ни на что не влияют |
| `src/constants/index.ts` | email, Telegram | 15+ файлов | **безопасно для значения**, но меняется по всему сайту сразу (так и задумано) |

### 7.2 Презентационные компоненты (без запросов и без общего использования)

Текст, заголовки, списки внутри JSX менять безопасно:

| Файл | Использование | Примечание |
|---|---|---|
| `src/components/sections/HeroNew.tsx` | только главная | `CARDS` `:10+`, H1 `:88`. **Не трогать** `id="hero"` и вызов `onOpenWizard`. |
| `src/components/home/HomeStats.tsx` | только главная | цифры и тексты. Сохранить `id="stats"`. |
| `src/components/home/HomeProcess.tsx` | только главная | тексты шагов, `PROGRESS_ROWS` `:122`. Сохранить `id="process"`. |
| `src/components/home/HomeSolutions.tsx` | только главная | заголовок секции |
| `src/components/home/HomeNews.tsx` | только главная | заголовок; данные — в `news.ts` |
| `src/components/home/HomeFinalCTA.tsx` | только главная | заголовок и подзаголовок. **Не трогать** `<QuickLeadForm … />` и `id="cta"`. |
| `src/components/cms/CmsHomePage.tsx` `INCLUDED`, `HomeIncluded` (`:19-72`) | главная (сейчас не рендерится) | безопасно |
| `src/pages/products/WebsitesPage.tsx`, `AIAgentsPage.tsx`, `VideoPage.tsx` | по одной странице | весь контент — ХК. Не трогать `usePageMeta` og.url. |
| `src/pages/services/ServiceConsulting.tsx` | одна страница | тексты, пакеты, FAQ. Не трогать `QuickLeadForm`. |
| `src/pages/ContactPage.tsx` | одна страница | тексты |
| `src/routes/privacy.tsx`, `offer.tsx`, `cookies.tsx` | по одной странице | юридические тексты — безопасно технически, но это документы |
| `src/pages/ServicesPage.tsx` | одна страница | тексты шапки и контактов. `useBrief` не трогать. |
| `src/pages/NotFound.tsx` | 404 | безопасно |
| `src/components/kp/KP*.tsx` | `/kp`, `/kp/:slug` | тексты-подписи. Данные идут пропсами, их типы в `src/lib/cms-api.ts` не менять. |

### 7.3 Безопасно для текста, но не для структуры

- **`src/components/layout/MainNav.tsx:10-17`, `src/components/Footer.tsx:8-13`.** Подписи (`label`) — безопасно. `href`/`to` — только на существующие роуты из §1.1.
- **`src/components/layout/SeriesRail.tsx:9-16`.** `label` — безопасно. `id` должны совпадать с `id` секций главной.
- **`src/hooks/useLanguage.tsx`.** Значения переводов — безопасно. Ключи — нет: используются через `t("…")` по всему коду.
- **`index.html`.** `<title>`/`description` — безопасно. OG-картинка требует реально размещённого файла.
- **`public/sitemap.xml`.** Текст безопасен, но URL должны соответствовать §1.1.

### 7.4 Через админку без разработчика (прямо сейчас)
- **Кейсы** на главной и `/cases`: `/admin/cases` (+ картинки через `/admin/media`).
- **Legacy-страницы** `/works`, `/projects`, `/legal/:slug` и тексты `/chat`: `/admin/pages` (в сайдбаре нет, открывать по URL).
- **Витрина `/kp`:** ключ `kp.showcase` в `/admin/settings` (флаг «публичный»).
- **Ассистент и база знаний** публичного `/chat`: `/admin/assistants`, `/admin/knowledge`.

Всё остальное публичное (главная кроме кейсов, услуги, продукты, блог, контакты, документы, шапка/футер) — **только правкой кода** по файлам из §2.8 и §7.1-7.2.
