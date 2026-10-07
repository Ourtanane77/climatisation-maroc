#!/bin/sh
# Restores a backup made by `php artisan app:backup` (database + public and private storage).
# Backups live in the php container at storage/app/private/backups/<YYYY-MM-DD_HHMMSS>/ (or
# BACKUP_PATH). THE CURRENT DATABASE AND FILES ARE REPLACED: make a fresh backup first.
#
#   scripts/restore.sh                 # lists the available backups
#   scripts/restore.sh 2026-10-07_031500
#   COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod" scripts/restore.sh <name>
set -eu

COMPOSE=${COMPOSE:-docker compose}
export MSYS_NO_PATHCONV=1
ROOT=$($COMPOSE exec -T php php -r 'require "vendor/autoload.php"; $a = require "bootstrap/app.php"; $a->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo config("backup.path");')

if [ $# -eq 0 ]; then
  echo "Backups in $ROOT:"
  $COMPOSE exec -T php ls -1 "$ROOT"
  exit 0
fi

DIR="$ROOT/$1"
$COMPOSE exec -T php test -f "$DIR/database.sql.gz" || { echo "No backup $DIR" >&2; exit 1; }

printf 'Replace the database and files with backup %s? Type "oui" to continue: ' "$1"
read -r answer
[ "$answer" = "oui" ] || { echo "Cancelled."; exit 1; }

echo "Restoring the database…"
$COMPOSE exec -T php sh -c 'zcat "$0/database.sql.gz" | MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USERNAME" "$DB_DATABASE"' "$DIR"

echo "Restoring the files…"
$COMPOSE exec -T -u root php tar -xzf "$DIR/storage-public.tar.gz" -C /var/www/backend/storage/app/public
$COMPOSE exec -T -u root php tar -xzf "$DIR/storage-private.tar.gz" -C /var/www/backend/storage/app/private
$COMPOSE exec -T -u root php chown -R www-data:www-data /var/www/backend/storage/app

echo "Refreshing caches…"
$COMPOSE exec -T php sh -c 'php artisan optimize:clear >/dev/null && php artisan optimize >/dev/null && php artisan filament:optimize >/dev/null && php artisan queue:restart'
$COMPOSE exec -T php php artisan tinker --execute='App\Support\Frontend\Revalidator::changed();' >/dev/null

echo "Restored $1."
