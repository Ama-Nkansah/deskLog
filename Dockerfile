FROM node:22-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts tsconfig.json ./
RUN BUILD_ENV=docker npm run build

FROM richarvey/nginx-php-fpm:3.1.6
COPY . .
COPY --from=node-builder /app/public/build public/build

ENV SKIP_COMPOSER=1
ENV WEBROOT=/var/www/html/public
ENV PHP_ERRORS_STDERR=1
ENV RUN_SCRIPTS=1
ENV REAL_IP_HEADER=1
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x scripts/00-laravel-deploy.sh

EXPOSE 80

CMD ["/start.sh"]
