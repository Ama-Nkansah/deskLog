# Stage 1 — Generate wayfinder TypeScript route files (needs PHP + Composer)
# composer:2 has PHP 8 + Composer + common extensions pre-installed
FROM composer:2 AS php-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
COPY . .
RUN php artisan package:discover --ansi \
    && touch database/database.sqlite \
    && cp .env.example .env \
    && php artisan key:generate --force \
    && php artisan wayfinder:generate --with-form

# Stage 2 — Build Vite/React assets (needs Node + wayfinder output from stage 1)
FROM node:22-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources/ resources/
COPY --from=php-builder /app/resources/js/routes resources/js/routes
COPY --from=php-builder /app/resources/js/actions resources/js/actions
COPY --from=php-builder /app/resources/js/wayfinder resources/js/wayfinder
COPY public/ public/
COPY vite.config.ts tsconfig.json ./
RUN BUILD_ENV=docker npm run build

# Stage 3 — Production image (PHP 8.4, actively maintained, NGINX + PHP-FPM bundled)
FROM serversideup/php:8.4-fpm-nginx-alpine-v3.5.2
WORKDIR /var/www/html

COPY --from=php-builder /app/vendor vendor/
COPY --from=node-builder /app/public/build public/build
COPY . .

ENV NGINX_WEBROOT=/var/www/html/public
ENV PHP_OPCACHE_ENABLE=1
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY scripts/00-laravel-deploy.sh /entrypoint.d/00-laravel-deploy.sh
RUN chmod +x /entrypoint.d/00-laravel-deploy.sh

EXPOSE 8080
