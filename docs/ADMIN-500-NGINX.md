# 500 на `/admin` (nginx) — типичные причины

Сообщение **«500 Internal Server Error»** от **nginx** значит: nginx не смог отдать ответ (часто — нет файла, неверный `root`, или ошибка в `proxy_pass`). Для **SPA (Vite/React)** почти всегда нужно отдавать **`index.html`** для любых путей приложения.

## 1. SPA fallback

Запрос `GET https://neeklo.ru/admin` не должен искать физическую папку `admin` на диске. Нужно:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Если админка отдаётся из `dist/`:

```nginx
root /var/www/neeklo.ru/dist;
index index.html;
location / {
    try_files $uri $uri/ /index.html;
}
```

## 2. Сборка фронта

Убедитесь, что после `git pull` выполнен **`npm ci` и `npm run build`**, и nginx смотрит на актуальный **`dist/`**.

## 3. Если фронт проксируется на Node

Тогда 500 может давать процесс (PM2). Смотрите логи: `pm2 logs neeklo-api` и `error.log` nginx.

## 4. Отличие от ошибки API

Ошибки **GET /crm/leads** (401/500) видны уже **внутри** загруженной админки (сообщение в UI или в DevTools → Network). Если страница целиком 500 от nginx — сначала проверьте пункты 1–2.
