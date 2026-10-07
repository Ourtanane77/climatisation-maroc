#!/bin/sh
# Prepares Laravel before the main process starts.
# APP_ROLE=app runs migrations and optional seeding; workers (queue, scheduler) skip it.
set -e

cd /var/www/backend

# Dev bind mounts arrive root-owned: let php-fpm workers (www-data) write logs, cache and views.
if [ "$(id -u)" = "0" ]; then
  chmod -R ug+rwX,o+rwX storage bootstrap/cache 2>/dev/null || true
fi

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if [ "${APP_ROLE:-app}" = "app" ]; then
  echo "Waiting for MySQL..."
  i=0
  until php -r 'try{new PDO("mysql:host=".getenv("DB_HOST").";port=".(getenv("DB_PORT")?:3306),getenv("DB_USERNAME"),getenv("DB_PASSWORD"));}catch(Exception $e){exit(1);}'; do
    i=$((i+1)); [ "$i" -gt 60 ] && echo "MySQL not reachable" && exit 1
    sleep 2
  done

  # /storage is served by nginx from a mount of storage/app/public: no public/storage symlink needed.
  php artisan migrate --force
  # APP_SEED=auto seeds an empty database once; true always reseeds (seeders are idempotent).
  case "${APP_SEED:-false}" in
    true) php artisan db:seed --force ;;
    auto) php artisan app:seed-if-empty ;;
  esac
  # Config, route and event caches plus Filament's component cache: without them every request
  # re-reads hundreds of files, which takes ~1 s on a dev bind mount. After editing config, routes
  # or .env in development run `make cache`. Tests never read these caches (phpunit.xml).
  php artisan optimize
  php artisan filament:optimize
  # A new release: queue workers finish their current job and restart on the new code.
  php artisan queue:restart
fi

exec "$@"
