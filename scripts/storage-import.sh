#!/bin/sh
# Imports a public-storage archive made by scripts/storage-export.sh into the running stack, then
# links the product photos to the files (catalog:download-images reuses files already on the disk,
# so nothing is downloaded from the old site when the archive is complete). Existing files with the
# same name are overwritten; others are kept.
#
#   scripts/storage-import.sh archive.tar.gz
#   COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod" scripts/storage-import.sh archive.tar.gz
set -eu

COMPOSE=${COMPOSE:-docker compose}
ARCHIVE=${1:?usage: scripts/storage-import.sh archive.tar.gz}
[ -f "$ARCHIVE" ] || { echo "Archive not found: $ARCHIVE" >&2; exit 1; }

export MSYS_NO_PATHCONV=1
$COMPOSE exec -T -u root php tar -xzf - -C /var/www/backend/storage/app/public < "$ARCHIVE"
$COMPOSE exec -T -u root php chown -R www-data:www-data /var/www/backend/storage/app/public
$COMPOSE exec -T php php artisan catalog:download-images

echo "Storage imported from $ARCHIVE."
