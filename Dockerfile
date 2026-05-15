FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    nodejs \
    npm \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_sqlite mbstring fileinfo tokenizer xml ctype

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN npm install && npm run build

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD touch database/database.sqlite && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
