#!/bin/sh
# Exports the public storage (product photos and their WebP versions, brand logos, uploaded
# images) to a .tar.gz on the host, e.g. to seed a new server without downloading the photos from
# the old site again (import it with scripts/storage-import.sh, then `catalog:download-images`
# reuses the files).
#
#   scripts/storage-export.sh [archive.tar.gz]
#   COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod" scripts/storage-export.sh
set -eu

COMPOSE=${COMPOSE:-docker compose}
ARCHIVE=${1:-storage-public-$(date +%Y%m%d-%H%M%S).tar.gz}

# MSYS_NO_PATHCONV: keep container paths as they are under Git Bash on Windows.
MSYS_NO_PATHCONV=1 $COMPOSE exec -T php tar -czf - -C /var/www/backend/storage/app/public \
  --exclude=./livewire-tmp . > "$ARCHIVE"

echo "Storage exported to $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))."
