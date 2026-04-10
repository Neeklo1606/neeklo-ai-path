# Продакшен-сервер neeklo.ru

**Единый VPS:** `89.169.39.244` (root по SSH).

В локальном `~/.ssh/config` — алиас **`Host neeklo-prod`** / **`neeklo`** → этот IP. На этом сервере в `authorized_keys` обычно ключ **`~/.ssh/id_rsa`** (не путать с ключом только для GitHub).

Каталог приложения: **`/var/www/neeklo.ru`**. В корне должен быть **`.env`** с **`DATABASE_URL`**, **`JWT_SECRET`** и др., иначе `deploy.sh` упадёт на шаге Prisma после успешной сборки фронта.

Деплой после пуша в `main`:

```bash
ssh neeklo-prod 'cd /var/www/neeklo.ru && bash deploy.sh'
```

Проверка: `GET https://neeklo.ru/cms-api/deploy/status`.
