# Деплой на BeGet (shared)

## Правила безопасности

- Не трогайте чужие сайты в `/home/...`, только каталог своего домена (например `neeklo/public_html`).
- Очищайте **только содержимое** своего `public_html`, не родительские папки.

## Краткая последовательность

1. **SSH** → перейти в каталог сайта, убедиться, что это ваш проект.
2. **Клон** репозитория в `public_html` (или pull), не удаляя чужие конфиги вне этой папки.
3. **`node -v`** — нужен Node **18+** (лучше 20 LTS).
4. **`npm install`**
5. **`.env`** — скопируйте с `deploy/beget/env.example`, заполните `DATABASE_URL`, Supabase, **`JWT_SECRET` ≥ 32 символов**, `PORT=8787`.
6. **`npx prisma generate`** → **`npx prisma db push`** → **`npx prisma db seed`**
7. **Supabase SQL** — выполнить `supabase/migrations/20260403120000_cms_core.sql` в SQL Editor.
8. **`node server/seed-cms-content.mjs`** (нужен `SUPABASE_SERVICE_ROLE_KEY`).
9. **API:** `pm2 start deploy/beget/ecosystem.config.cjs` или `npm run start:api` (в screen/tmux для теста).
10. **`npm run build`**
11. **Статика:** `cp -r dist/* .` в корень `public_html` (где лежит будущий `index.html`).
12. **`.htaccess`:** `cp deploy/beget/htaccess.example .htaccess` и при необходимости поправьте порт, если не 8787.

## Проверка

- `https://ваш-домен/cms-api/pages/slug/home?locale=ru` — JSON со `slug: "home"`.
- `/admin/login` — учётка из `prisma db seed` (по умолчанию см. `prisma/seed.mjs`).

## Если не работает

| Симптом | Куда смотреть |
|--------|----------------|
| 500 на `/cms-api/...` | Таблицы Supabase, ключи, `pm2 logs neeklo-api` |
| 404 home | Не выполнен `seed-cms-content.mjs` |
| Логин 500 | `DATABASE_URL`, `npx prisma db push`, логи API |
| Прокси не бьётся | `mod_proxy`, флаг `[P]` в `.htaccess`, порт |

Если хостинг **не даёт** слушать локальный порт и **нет** reverse proxy — напишите «beget не даёт порт открыть»: понадобится обход (PHP proxy / внешний API).

## Важно

- Фронт по умолчанию ходит в API по префиксу **`/cms-api`** (как в `vite` proxy при разработке).
- В репозитории сервер слушает **`PORT` или `CMS_SERVER_PORT` или 8787**.
