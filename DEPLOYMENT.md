# Render Deployment — Findings & Fix Plan

## Do You Need Docker Compose?

No. Docker Compose is for running multiple separate containers (e.g. a standalone
frontend + a standalone backend + a database server). Your app is a monolith:
Laravel serves the compiled React/Vite assets and the PHP code from the same
process. One Docker container on Render is the correct setup.

Render does not support Docker Compose anyway — it is an open feature request
that is still "under review" as of May 2026.

---

## Why Deploys Are Failing Right Now

### Problem 1 — `php artisan serve` is a development server

`start.sh` runs `php artisan serve`. This is a single-threaded dev server not
intended for production. Render expects a proper web server process.

**Fix:** Replace with NGINX + PHP-FPM, which is the production-grade combo for
PHP apps and what Render's own Laravel Docker example uses.

### Problem 2 — SQLite file is erased on every redeploy

The `database/database.sqlite` file lives inside the Docker container. When
Render rebuilds and redeploys the container, the file is wiped. All data is lost.

**Fix option A (simplest):** Mount a Render Persistent Disk at `/data` and
point SQLite at `/data/database.sqlite`. The disk survives redeploys.

**Fix option B (more production-grade):** Switch `DB_CONNECTION` to PostgreSQL
and use Render's managed Postgres add-on.

---

## The Plan (Option A — SQLite + Persistent Disk)

### 1. New Dockerfile

Switch from `php:8.4-cli` + `php artisan serve` to `php:8.4-fpm` + NGINX.

```dockerfile
FROM php:8.4-fpm-alpine

RUN apk add --no-cache nginx nodejs npm unzip git sqlite-dev \
    && docker-php-ext-install pdo pdo_sqlite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN npm install && npm run build

RUN cp .env.example .env && php artisan key:generate --force
RUN chmod -R 775 storage bootstrap/cache && chmod +x start.sh

COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 8000
CMD ["sh", "start.sh"]
```

### 2. NGINX config (`nginx.conf` in project root)

```nginx
server {
    listen 8000;
    root /app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 3. Updated `start.sh`

```sh
#!/bin/sh

# Write env vars into .env
[ -n "$APP_KEY" ]   && sed -i "s|^APP_KEY=.*|APP_KEY=$APP_KEY|"     .env
[ -n "$APP_ENV" ]   && sed -i "s|^APP_ENV=.*|APP_ENV=$APP_ENV|"     .env
[ -n "$APP_DEBUG" ] && sed -i "s|^APP_DEBUG=.*|APP_DEBUG=$APP_DEBUG|" .env
[ -n "$APP_URL" ]   && sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|"     .env

grep -q "^APP_KEY=base64:" .env || php artisan key:generate --force

# SQLite lives on the persistent disk, not inside the container
mkdir -p /data
touch /data/database.sqlite
sed -i "s|database/database.sqlite|/data/database.sqlite|" .env

php artisan migrate --force

# Start PHP-FPM in background, then NGINX in foreground
php-fpm -D
exec nginx -g "daemon off;"
```

### 4. Render service settings

In your Render Web Service dashboard:
- **Environment:** Docker
- **Port:** 8000
- **Disk:** Add a Persistent Disk → Mount Path `/data`, Size 1 GB
- **Environment variables to set:**
  - `APP_KEY` — run `php artisan key:generate --show` locally and paste the value
  - `APP_ENV` = `production`
  - `APP_DEBUG` = `false`
  - `APP_URL` = your Render URL (e.g. `https://npontu-tracker.onrender.com`)

---

## The Plan (Option B — PostgreSQL)

If you switch to PostgreSQL, the Dockerfile and NGINX steps above are the same.
The differences are:

1. Add the `pgsql` PHP extension in the Dockerfile:
   ```dockerfile
   RUN apk add --no-cache postgresql-dev \
       && docker-php-ext-install pdo pdo_pgsql
   ```

2. In `start.sh`, remove the SQLite lines and instead inject `DATABASE_URL`
   from Render's managed Postgres add-on.

3. Update `config/database.php` to use `DB_CONNECTION=pgsql` by default,
   or set it via the `DB_CONNECTION` env var on Render.

4. No Persistent Disk needed.

---

## Decision Summary

| | SQLite + Persistent Disk | PostgreSQL |
|---|---|---|
| Cost on Render | Disk costs ~$0.25/GB/month | Postgres free tier available |
| Data safety | Single file, backed up by Render daily | Managed, replicated |
| Code changes | Minimal | Requires DB config change |
| Complexity | Low | Low |
| Recommended for this project? | Yes (simple, matches current setup) | Yes if scaling later |
