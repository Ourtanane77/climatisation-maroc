# Development setup

Everything runs in Docker: PHP, Composer, Node and MySQL are not needed on the host,
except Node 22 for the Playwright end-to-end tests and the smoke test.

## First start

```sh
cp .env.example .env                    # ports, revalidation secret
cp backend/.env.example backend/.env    # Laravel settings (make up does this when missing)
make up
docker compose exec php php artisan key:generate   # first time only (APP_KEY is empty in the example)
make cache                                          # the config is cached at start: rebuild it
```

`make up` builds and starts the stack. The `php` container's entrypoint then:

1. waits for MySQL and runs the migrations;
2. seeds an empty database (`APP_SEED=auto` → `php artisan app:seed-if-empty`): roles and staff
   accounts, cities, brands, categories, the catalogue from `data/catalog.json`, design content,
   home settings and, outside production, demo data (a reseller, an order, a lead);
3. downloads the catalogue images from the old site into `storage/app/public` with their WebP
   renditions (`catalog:download-images`; failures are not fatal, rerun with `make images`);
4. caches config, routes, events and Filament components (`php artisan optimize`,
   `filament:optimize`).

| URL | What |
|---|---|
| http://localhost:8080 | site (nginx → Next.js) |
| http://localhost:8080/admin | back office (Filament) |
| http://localhost:8080/api/v1/health | API health |
| http://localhost:8025 | Mailpit (every e-mail sent in development) |

Development accounts come from the `SEED_*` values in `backend/.env`:
`admin@climatisationmaroc.test` / `change-me-admin` (administrator),
`gestionnaire@climatisationmaroc.test` / `change-me-manager` (manager), and the demo reseller
`contact@froid-atlas.ma` / `change-me-reseller`.

## Make targets

| Target | What it does |
|---|---|
| `make up` / `make down` | start (build, migrate, seed if empty) / stop the stack |
| `make migrate`, `make seed`, `make fresh` | migrations, seeders, `migrate:fresh --seed` (wipes the dev database) |
| `make cache` | rebuild Laravel's caches; **run it after editing config, routes or `backend/.env`** (the entrypoint caches them at start) |
| `make test` | backend Pest and frontend Vitest |
| `make lint` | Pint, Larastan, ESLint, tsc |
| `make e2e` | Playwright end-to-end tests against the running stack (from the host) |
| `make smoke` | smoke test through nginx (`BASE_URL=…` for another stack) |
| `make images` | download missing catalogue images |
| `make logs`, `make sh-php`, `make sh-next` | logs, shells |

Without `make` (plain Windows shell), run the `docker compose …` lines from the `Makefile`.

## Windows and macOS notes

- `backend/vendor` lives in a named Docker volume (`backend_vendor`): a bind-mounted `vendor/`
  is far too slow on Windows. Composer runs inside the `php` container.
- The Next.js dev server runs `next dev --webpack` with polling (`WATCHPACK_POLLING`), because
  file events do not cross the bind mount. Turbopack cannot poll; host development
  (`cd frontend && npm run dev`) keeps it.
- Line endings are LF (`.gitattributes`).
- Port 33306 exposes MySQL to the host (`DB_FORWARD_PORT` in `.env`).

## Tests

### Backend (Pest)

```sh
make test-back
docker compose exec -T php php artisan test --compact tests/Feature/Api/Catalog   # a folder
```

Tests run against the MySQL database `climatisation_test` (created by `docker/mysql/init.sql`
when the MySQL volume is first created), refreshed per test. `phpunit.xml` **forces** the test
settings as `<env>` and `<server>` entries: Docker puts the dev values (`DB_DATABASE=climatisation`,
Redis cache…) in `$_SERVER`, which Laravel reads first, so without the forced values a test run
would wipe the dev database. It also points Laravel at separate cache files, so tests never read
the dev config cache.

To run several suites in parallel, give each its own database (only `climatisation_test*` names
are accepted, see `tests/TestCase.php`):

```sh
docker compose exec -T -e TEST_DB_DATABASE=climatisation_test_b php php artisan test --compact
```

Create the extra database once:

```sh
docker compose exec mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE climatisation_test_b; GRANT ALL ON climatisation_test_b.* TO '"'"'climatisation'"'"'@'"'"'%'"'"';"'
```

### Frontend (Vitest, ESLint, types)

```sh
make test-front
cd frontend && npm run lint && npm run typecheck
```

### End-to-end (Playwright) and smoke test

Run from the host against the running stack (`make up` first):

```sh
cd frontend && npm ci && npx playwright install chromium   # once
make e2e        # or: cd frontend && E2E_RESELLER_PASSWORD=change-me-reseller npm run test:e2e
make smoke
```

The end-to-end tests place real orders and leads named « E2E Test … » in the dev database;
`frontend/e2e/global-teardown.ts` deletes them with `php artisan app:e2e-cleanup` (refused in
production). `E2E_BASE_URL` targets another stack; `E2E_CLEANUP=0` keeps the rows.
The reseller scenario needs the demo reseller (development seeding) and is skipped without
`E2E_RESELLER_PASSWORD`.

The dev server compiles each page on its first visit: a first run can be slow, and edits made
while the tests run trigger Fast Refresh. For a stable run, use a production stack
(`docs/deployment.md`) with `E2E_BASE_URL`.

### Visual comparison with the design

```sh
python -m http.server 5500 -d design            # serves the design files
cd frontend && node scripts/visual-compare.mjs phase-4a
```

Pairs are listed in `frontend/scripts/visual/<phase>.mjs`; screenshots at 1440 and 390 px go to
`frontend/test-results/visual/<phase>/`.

## Design assets

`design/uploads/` holds the images of the design export. `frontend/scripts/sync-design-assets.mjs`
(run before `dev` and `build`) copies the logo and the design photos to `frontend/public/brand/`
and `frontend/public/design/` (not committed). Pages use a design photo only when the file is
present, and an image uploaded in the back office wins. After replacing a file in
`design/uploads/`, run `cd frontend && npm run sync-assets` (or restart the `next` container).

## Useful commands

```sh
docker compose exec php php artisan app:seed-if-empty     # seed only an empty database
docker compose exec php php artisan catalog:download-images --force
docker compose exec php php artisan app:e2e-cleanup        # delete « E2E Test » orders and leads
```
