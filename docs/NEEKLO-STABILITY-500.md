# Стабильность neeklo.ru: 500 / обрывы при переходах

Сообщение **«500 Internal Server Error»** с подписью **nginx** на HTML-страницах (`/`, `/chat`, `/admin`, …) почти никогда не генерирует React — его отдаёт **nginx** или прокси до **Node**, если конфигурация сайта отличается от остальных виртуальных хостов.

## 1. Окно без `dist` при деплое (исправлено в `deploy.sh`)

Раньше скрипт делал `rm -rf dist` **до** `npm run build`. Пока шла сборка, nginx смотрел в пустой каталог → пользователи видели **500**, **404** или пустую страницу.

Сейчас сборка идёт в временную папку `dist.build.<pid>`, затем **атомарно** переименовывается в `dist`. Старый `dist` удаляется только после успешной сборки.

## 2. Обязательный SPA-fallback для Vite/React

Запросы вида `GET /chat` не должны искать каталог `chat` на диске. Нужно:

```nginx
root /var/www/neeklo.ru/dist;
index index.html;

location / {
    try_files $uri $uri/ /index.html;
}
```

Без `try_files` поведение зависит от версии nginx и прав — возможны **500** и непредсказуемые ответы.

Подробнее: [ADMIN-500-NGINX.md](./ADMIN-500-NGINX.md).

## 3. API `/cms-api` → Node (PM2)

Типичный фрагмент:

```nginx
location /cms-api/ {
    proxy_pass http://127.0.0.1:8787/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 300s;
}
```

Если upstream (Node) **недоступен**, чаще будет **502 Bad Gateway**, но при ошибках в конфиге или `proxy_pass` возможны и **500**.

Проверка с сервера:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8787/health
curl -sS -o /dev/null -w "%{http_code}\n" -H "Host: neeklo.ru" https://neeklo.ru/chat
```

## 4. Диагностика «в момент сбоя»

На VPS при открытой странице с 500:

```bash
sudo tail -n 80 /var/log/nginx/error.log
pm2 logs neeklo-api --lines 80 --nostream
```

Искать: `connect() failed`, `upstream timed out`, `Permission denied`, `rewrite or internal redirection cycle`.

## 5. PM2 и память

В `ecosystem.config.cjs` задано `max_memory_restart: "400M"`. При утечке или пике памяти процесс перезапускается — на секунды возможны **502**. Смотреть: `pm2 show neeklo-api`, `pm2 logs`.

## 6. Почему «другие сайты без проблем»

У neeklo отдельный стек: **статика SPA + отдельный Node API + длинные запросы к AI**. Любой другой сайт на том же сервере может быть «только PHP» или «только статика» — другая нагрузка и другой `server { }` в nginx.

---

**Чеклист после правок:** `sudo nginx -t && sudo systemctl reload nginx`, затем проверить главную и `/chat` в приватном окне и с жёстким обновлением (Ctrl+F5).
