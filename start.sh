#!/bin/sh
touch database/database.sqlite
php artisan migrate --force
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
