#!/bin/sh
[ -n "$APP_KEY" ]   && sed -i "s|^APP_KEY=.*|APP_KEY=$APP_KEY|"     .env
[ -n "$APP_ENV" ]   && sed -i "s|^APP_ENV=.*|APP_ENV=$APP_ENV|"     .env
[ -n "$APP_DEBUG" ] && sed -i "s|^APP_DEBUG=.*|APP_DEBUG=$APP_DEBUG|" .env
[ -n "$APP_URL" ]   && sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|"     .env

grep -q "^APP_KEY=base64:" .env || php artisan key:generate --force

touch database/database.sqlite
php artisan migrate --force
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
