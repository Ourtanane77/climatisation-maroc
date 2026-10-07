# Developer commands. All tools run inside the containers.
# Without make (Windows shell): run the docker compose lines below directly.

DC      = docker compose
PHP     = $(DC) exec php
NEXT    = $(DC) exec next
ARTISAN = $(PHP) php artisan

.PHONY: up down build migrate seed fresh cache test test-back test-front lint lint-back lint-front logs sh-php sh-next images e2e smoke \
	prod-build prod-up prod-down prod-logs prod-migrate prod-cache prod-ps backup prod-backup

## Build and start the stack. Migrations run on start; an empty database is seeded.
up:
	@test -f backend/.env || cp backend/.env.example backend/.env
	$(DC) up -d --build
	@echo "Site: http://localhost:8080  ·  Admin: http://localhost:8080/admin  ·  Mailpit: http://localhost:8025"

down:
	$(DC) down

build:
	$(DC) build

migrate:
	$(ARTISAN) migrate

seed:
	$(ARTISAN) db:seed

fresh:
	$(ARTISAN) migrate:fresh --seed

# Rebuild Laravel's config/route/event caches and Filament's (run after editing config, routes or .env).
cache:
	$(ARTISAN) optimize:clear
	$(ARTISAN) optimize
	$(ARTISAN) filament:optimize

test: test-back test-front

test-back:
	$(PHP) ./vendor/bin/pest

test-front:
	$(NEXT) npx vitest run

lint: lint-back lint-front

lint-back:
	$(PHP) ./vendor/bin/pint --test
	$(PHP) ./vendor/bin/phpstan analyse --memory-limit=1G --no-progress

lint-front:
	$(NEXT) npm run lint
	$(NEXT) npx tsc --noEmit

logs:
	$(DC) logs -f --tail=100

sh-php:
	$(PHP) sh

sh-next:
	$(NEXT) sh

## Download catalogue images from the old site into local storage (phase 3).
images:
	$(ARTISAN) catalog:download-images

## End-to-end tests (Playwright, run on the host against the running stack: make up first).
## Orders and leads named "E2E Test …" are deleted afterwards (php artisan app:e2e-cleanup).
E2E_RESELLER_PASSWORD ?= change-me-reseller
e2e:
	cd frontend && E2E_RESELLER_PASSWORD=$(E2E_RESELLER_PASSWORD) npx playwright test

## Smoke test through nginx: front office, API, back office, Livewire script, /storage, revalidation.
smoke:
	node scripts/smoke.mjs $(or $(BASE_URL),http://localhost:8080)

## ---- Production (docker-compose.prod.yml + .env.prod, see docs/deployment.md) ----
PROD_ENV_FILE ?= .env.prod
PROD = $(DC) -f docker-compose.prod.yml -f docker-compose.ports.yml --env-file $(PROD_ENV_FILE)

## Build the production images (php, nginx, next).
prod-build:
	$(PROD) build

## Start or update the production stack (migrations run on start; an empty database is seeded once).
prod-up:
	$(PROD) up -d

## Stop the production stack (volumes kept).
prod-down:
	$(PROD) down

## Follow the production logs (all containers, or SERVICE=php|queue|next|nginx…).
prod-logs:
	$(PROD) logs -f --tail=200 $(SERVICE)

## Container states and health.
prod-ps:
	$(PROD) ps

## Run pending migrations on the running production stack.
prod-migrate:
	$(PROD) exec php php artisan migrate --force

## Rebuild Laravel and Filament caches (after changing .env.prod: also restart php, queue, scheduler).
prod-cache:
	$(PROD) exec php sh -c "php artisan optimize:clear && php artisan optimize && php artisan filament:optimize && php artisan queue:restart"

# Backups (database + storage archives, rotated; see docs/deployment.md). Restore: scripts/restore.sh
backup:
	$(ARTISAN) app:backup

prod-backup:
	$(PROD) exec php php artisan app:backup
