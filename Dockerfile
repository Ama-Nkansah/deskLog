FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    nodejs \
    npm \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_sqlite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN cp .env.example .env && php artisan key:generate --force

RUN npm install && npm run build

RUN chmod -R 775 storage bootstrap/cache && chmod +x start.sh

EXPOSE 8000

CMD ["sh", "start.sh"]
