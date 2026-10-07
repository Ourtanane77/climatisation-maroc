# Deployment

Production runs `docker-compose.prod.yml`: images are built from the repository, nothing is
bind-mounted. The stack was verified locally (build, migrations, seeding, image download,
smoke test, back-office login, revalidation) with a throwaway `.env.prod`, and a first deploy into
an empty database was replayed on 2026-10-07 (seeding twice is idempotent, no demo data).

| Service | Image | Role |
|---|---|---|
| `nginx` | `climatisation-maroc/nginx:prod` | entry point on `APP_PORT`; Laravel's `public/`, `/storage` files, proxy to Next.js |
| `php` | `climatisation-maroc/php:prod` | php-fpm; on start: migrations, seeding of an empty database, caches |
| `queue` | same image | `queue:work redis` (e-mails) |
| `scheduler` | same image | `schedule:work` (daily backup when `BACKUP_ENABLED=true`) |
| `next` | `climatisation-maroc/next:prod` | Next.js standalone server (port 3000, internal) |
| `mysql` | `mysql:8.4` | database (volume `mysql_data`) |
| `redis` | `redis:7-alpine` | cache, queue, sessions (volume `redis_data`, append-only) |

Volumes: `mysql_data`, `redis_data`, `storage_public` (product photos and their WebP versions,
brand logos, uploaded images; read-only in `nginx`) and `storage_private` (quote attachments and
the backups).

The `make prod-*` targets wrap the commands below (`PROD_ENV_FILE=.env.prod` by default):
`prod-build`, `prod-up`, `prod-down`, `prod-logs`, `prod-ps`, `prod-migrate`, `prod-cache`.
In the commands below, `$PROD` stands for
`docker compose -f docker-compose.prod.yml --env-file .env.prod`.

## Deploying with Coolify

The production compose file reads every setting from `${…}` variables, so it runs unchanged on
Coolify (a VPS with Coolify's own proxy and TLS).

1. New resource → your Git repository → build pack **Docker Compose**, compose file
   `/docker-compose.prod.yml` (do not add `docker-compose.ports.yml`: Coolify's proxy must own
   ports 80/443).
2. **Environment Variables**: paste the content of `.env.prod` (KEY=value lines). Required:
   `APP_KEY`, `APP_URL`, `REVALIDATE_SECRET`, `DB_PASSWORD`, `DB_ROOT_PASSWORD` — the deployment
   stops with a clear message if one is missing. Also set `NEXT_PUBLIC_SITE_URL` (it is baked into
   the Next.js build), the `MAIL_*` SMTP values and the `SEED_*` staff accounts.
3. **Domains**: on the `nginx` service only, `https://app.arfro.com` (nginx listens on port 80
   inside the network). Leave the other services without a domain. DNS: an `A` record for
   `app.arfro.com` to the VPS.
4. Deploy. The first start initialises MySQL (up to ~2 min), migrates, seeds and downloads the
   catalogue photos; follow it in the `php` service logs.
5. If a previous deployment failed while MySQL was initialising (for example with an empty
   `DB_ROOT_PASSWORD`), delete its `mysql-data` volume in Coolify (Storages) before redeploying:
   MySQL only applies the passwords to an empty data directory.

Coolify's proxy sends `X-Forwarded-For`/`X-Forwarded-Proto` from the Docker network, which Laravel
and nginx already trust; `TRUSTED_PROXIES` is not needed.

## Server, DNS and TLS

- Docker Engine with the Compose plugin; 2 vCPU, 4 GB RAM and 20 GB disk are comfortable.
- DNS: an `A` (and `AAAA` if IPv6) record for `app.arfro.com` pointing to the server. It is a
  subdomain: no `www` variant to redirect.
- A TLS terminator in front of `APP_PORT` (host nginx, Caddy, or a load balancer) that forwards
  `Host`, `X-Forwarded-Proto` and `X-Forwarded-For`, and redirects HTTP to HTTPS. Laravel trusts
  the proxy headers. Caddy example: `app.arfro.com { reverse_proxy 127.0.0.1:8080 }`.
- Outbound internet on the first start only if the product photos are downloaded from the old site
  (see « Photos » below).

## Environment (`.env.prod`)

Copy `.env.prod.example` to `.env.prod` (never commit it) and fill every value:

| Variable | Value |
|---|---|
| `APP_KEY` | generate after the first build: `docker run --rm -e APP_ROLE=worker climatisation-maroc/php:prod php artisan key:generate --show` |
| `APP_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_SITE_URL` | public URL, `https://app.arfro.com` (also used at Next.js build time: rebuild after changing it) |
| `APP_PORT` | port nginx listens on (behind the TLS terminator) |
| `REVALIDATE_SECRET` | long random string (`openssl rand -hex 32`); compose passes it to both Laravel and Next.js |
| `FRONTEND_INTERNAL_URL` | `http://next:3000` (keep) |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | strong random values (the MySQL container is created with them) |
| `SESSION_SECURE_COOKIE` | `true` behind HTTPS (back-office login fails over plain HTTP when true) |
| `MAIL_*`, `MAIL_FROM_ADDRESS` | SMTP of the shop's mail provider |
| `SHOP_NOTIFICATION_EMAIL` | where new orders and leads are sent (also editable in Réglages) |
| `SEED_ADMIN_*`, `SEED_MANAGER_*` | first staff accounts, created on the first start; change the passwords afterwards in Utilisateurs |
| `SEED_RESELLER_PASSWORD` | not used in production (demo data is never seeded there) |
| `BACKUP_ENABLED`, `BACKUP_KEEP`, `BACKUP_AT`, `BACKUP_PATH` | `true`, `14`, `03:15` (server time), default path `storage/app/private/backups` |
| `FILESYSTEM_DISK`, `AWS_*` | `public` (local volume) or `s3` |

## First deploy

```sh
git clone … climatisation-maroc && cd climatisation-maroc
cp .env.prod.example .env.prod && $EDITOR .env.prod
make prod-build                                    # or: $PROD build
docker run --rm -e APP_ROLE=worker climatisation-maroc/php:prod php artisan key:generate --show   # put it in APP_KEY
make prod-up                                       # or: $PROD up -d
make prod-logs SERVICE=php                         # migrations, seeding, photos
node scripts/smoke.mjs https://app.arfro.com     # from any machine with Node 22
```

The first start of `php` migrates, seeds the empty database (`APP_SEED=auto`: staff accounts,
reference data, catalogue from `data/catalog.json`, the client's Excel additions from
`data/excel-additions.json`, design content, home settings; never the demo data) and links the
product photos (`catalog:download-images`), then caches config, routes, events, views and
Filament's components. Re-running the seeders is safe: every seeder is idempotent and never
overwrites what the team changed in the back office (Excel prices excepted, see `docs/plan.md`).

### Photos

The catalogue photos come from the old site. Two ways to get them on the server:

1. **Copy them (recommended, no dependency on the old site).** On the machine that has them (the
   development stack, or the current production): `scripts/storage-export.sh photos.tar.gz`; copy
   the archive to the server; after `make prod-up`:
   `COMPOSE="$PROD" scripts/storage-import.sh photos.tar.gz`. The import links every photo to its
   file (`catalog:download-images` reuses files already on the disk) and downloads nothing that
   is present.
2. **Download them.** Without an import, the first start downloads them from the old site
   (retries, failures don't stop the start). Re-run later if some failed:
   `$PROD exec php php artisan catalog:download-images`.

### Before opening the site (owner checklist)

- Legal pages (CGV, CGU, informations légales, sécurité, confidentialité): write and publish them
  in Contenu › Pages; the checkout's CGV link appears once the CGV is published.
- Products flagged « À vérifier » (Produits, filter « À vérifier »): replace the temporary
  references `XLS-…` with the real ones and enter the missing prices (items at 0 are shown « Prix
  sur demande »). Bulk route: export the filtered list, fill « Nouvelle référence » and prices,
  re-import.
- Placeholder or unconfirmed facts listed in `docs/audits/content-redaction.md` (delivery delays,
  returns and warranty, promotion rate in the promo bar, « Distributeur officiel LG »).
- Photos of the shops and team for À propos (optional).
- The logo is in place (`frontend/public/logo-arfro.svg`, favicon `frontend/src/app/icon.svg`).
- Change the staff passwords; set `SHOP_NOTIFICATION_EMAIL`; send a test order and a test quote
  request and check the e-mails arrive.
- Search Console: add the property and submit `https://app.arfro.com/sitemap.xml`.

## Updating

```sh
$PROD exec php php artisan app:backup   # before every update
git pull
make prod-build
make prod-up        # recreates the changed containers; php runs pending migrations on start
make prod-cache     # optimize + filament:optimize + queue:restart (also after editing .env.prod)
node scripts/smoke.mjs https://app.arfro.com
```

The pages refresh by themselves after a back-office change (revalidation). After a code update the
new Next.js image starts with an empty cache, so nothing else is needed.

### Rollback

1. `git checkout <previous tag or commit>` then `make prod-build && make prod-up`.
2. If the update ran a migration that the old code cannot read, restore the backup taken before
   the update (below). Migrations are additive in this project; a code rollback alone is usually
   enough.

Tag each production release (`git tag v1.0.0`) so the previous version is easy to find.

## Revalidation

After a back-office change, Laravel calls `http://next:3000/api/revalidate` with
`REVALIDATE_SECRET` so pages show the change at once (`docs/architecture.md`, Caching). The route
answers 403 without the secret. If pages keep showing old content, check that both services
received the same secret:

```sh
$PROD exec next printenv REVALIDATE_SECRET
$PROD exec php php artisan tinker --execute='var_dump(App\Support\Frontend\Revalidator::send());'
```

## Mail, queue and scheduler

E-mails are queued on Redis and sent by the `queue` service; failed jobs land in `failed_jobs`
(`php artisan queue:failed`, `queue:retry all`). The `scheduler` service runs `schedule:work`
(`php artisan schedule:list` shows the jobs). Logs go to stderr (`LOG_CHANNEL=stderr`):
`make prod-logs`.

## Backups

`php artisan app:backup` writes one dated folder (`database.sql.gz`, `storage-public.tar.gz`,
`storage-private.tar.gz`) under `BACKUP_PATH`, on the `storage_private` volume, and keeps the
newest `BACKUP_KEEP`. With `BACKUP_ENABLED=true` the `scheduler` container runs it every day at
`BACKUP_AT`. A backup on the same disk does not survive the disk: copy the folder off the server,
e.g. a nightly host cron:

```sh
docker cp "$(docker compose -f docker-compose.prod.yml ps -q php)":/var/www/backend/storage/app/private/backups ./backups-copy
rsync -a ./backups-copy/ backup-host:/srv/climatisation-maroc/
```

Redis holds only cache, queue and sessions: it needs no backup.

### Restore

```sh
COMPOSE="$PROD" scripts/restore.sh                    # lists the backups
COMPOSE="$PROD" scripts/restore.sh 2026-10-07_031500  # asks for confirmation, then restores
```

The script replaces the database and the storage files with the backup, rebuilds the caches,
restarts the queue workers and refreshes the front office. Take a fresh backup first.

## Health checks

`nginx` checks Laravel's `/up`, `next` its `/api/health`, `php` the fpm config; MySQL and Redis
have their own. `make prod-ps` shows the state. `node scripts/smoke.mjs <url>` checks the front
office, the API, the back-office login, the Livewire script, a `/storage` photo, the revalidation
guard, the 404 of unpublished pages, `sitemap.xml` and `robots.txt`.
