# Деплой на BeGet (shared)

## Правила безопасности

- Не трогайте чужие сайты в `/home/...`, только каталог своего домена (например `neeklo/public_html`).
- Очищайте **только содержимое** своего `public_html`, не родительские папки.

## Краткая последовательность

1. **SSH** → перейти в каталог сайта, убедиться, что это ваш проект.
2. **Клон** репозитория в `public_html` (или pull), не удаляя чужие конфиги вне этой папки.
3. **`node -v`** — нужен Node **18+** (лучше 20 LTS).
4. **`npm install`**
5. **`.env`** — скопируйте с `deploy/beget/env.example`, заполните **`DATABASE_URL`**, **`JWT_SECRET` ≥ 32 символов**, `PORT=8787`.
6. **`npx prisma generate`** → **`npx prisma db push`** → **`npx prisma db seed`**
7. **`npm run seed:cms`** (контент страниц CMS в PostgreSQL).
8. **API:** `pm2 start deploy/beget/ecosystem.config.cjs` или `npm run start:api`.
9. **`npm run build`**
10. **Статика:** `cp -r dist/* .` в корень `public_html`.
11. **`.htaccess`:** `cp deploy/beget/htaccess.example .htaccess` (при необходимости поправьте порт).

Загрузки медиа сохраняются в **`public/uploads/`** и отдаются как статика с сайта (`/uploads/...`).

## Проверка

- `https://ваш-домен/cms-api/pages/slug/home?locale=ru` — JSON со `slug: "home"`.
- `/admin/login` — учётка из `prisma db seed` (по умолчанию см. `prisma/seed.mjs`).

## Если не работает

| Симптом | Куда смотреть |
|--------|----------------|
| 500 на `/cms-api/...` | `DATABASE_URL`, `pm2 logs neeklo-api` |
| 404 home | Не выполнен `npm run seed:cms` |
| Логин 500 | `JWT_SECRET`, `npx prisma db push`, логи API |
| Прокси не бьётся | `mod_proxy`, флаг `[P]` в `.htaccess`, порт |

Фронт по умолчанию ходит в API по префиксу **`/cms-api`**. Сервер слушает **`PORT` или `CMS_SERVER_PORT` или 8787**.
