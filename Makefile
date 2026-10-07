# Developer commands. All tools run inside the containers.
# Without make (Windows shell): run the docker compose lines below directly.

DC      = docker compose
PHP     = $(DC) exec php
NEXT    = $(DC) exec next
ARTISAN = $(PHP) php artisan

.PHONY: up down build migrate seed fresh cache test test-back test-front lint lint-back lint-front logs sh-php sh-next images e2e smoke

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
