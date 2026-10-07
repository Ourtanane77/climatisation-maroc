# Deployment

Production runs `docker-compose.prod.yml`: images are built from the repository, nothing is
bind-mounted. The stack was verified locally (build, migrations, seeding, image download,
smoke test, back-office login, revalidation) with a throwaway `.env.prod`.

| Service | Image | Role |
|---|---|---|
| `nginx` | `climatisation-maroc/nginx:prod` | entry point on `APP_PORT`; Laravel's `public/`, `/storage` files, proxy to Next.js |
| `php` | `climatisation-maroc/php:prod` | php-fpm; on start: migrations, seeding of an empty database, caches |
| `queue` | same image | `queue:work redis` (e-mails) |
| `scheduler` | same image | `schedule:work` |
| `next` | `climatisation-maroc/next:prod` | Next.js standalone server (port 3000, internal) |
| `mysql` | `mysql:8.4` | database (volume `mysql_data`) |
| `redis` | `redis:7-alpine` | cache, queue, sessions (volume `redis_data`, append-only) |

Volumes: `mysql_data`, `redis_data`, `storage` (uploaded and downloaded images, shared by `php`,
`queue`, `scheduler` and, read-only, `nginx`).

## Server

- Docker Engine with the Compose plugin; 2 vCPU and 4 GB RAM are comfortable.
- Outbound internet on the first start: the seeder downloads the catalogue images from the old
  site (`catalog:download-images`).
- A TLS terminator in front of `APP_PORT` (host nginx, Caddy, or a load balancer) that forwards
  `X-Forwarded-Proto` and `X-Forwarded-For`. Laravel trusts the proxy headers.

## Environment (`.env.prod`)

Copy `.env.prod.example` to `.env.prod` (never commit it) and fill every value:

| Variable | Value |
|---|---|
| `APP_KEY` | generate after the first build: `docker run --rm -e APP_ROLE=worker climatisation-maroc/php:prod php artisan key:generate --show` |
| `APP_URL`, `FRONTEND_URL` | public URL, e.g. `https://climatisationmaroc.com` (also used at Next.js build time) |
| `APP_PORT` | port nginx listens on (behind the TLS terminator) |
| `REVALIDATE_SECRET` | long random string (`openssl rand -hex 32`); compose passes it to both Laravel and Next.js |
| `FRONTEND_INTERNAL_URL` | `http://next:3000` (keep) |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | strong random values (the MySQL container is created with them) |
| `SESSION_SECURE_COOKIE` | `true` behind HTTPS (back-office login fails over plain HTTP when true) |
| `MAIL_*`, `MAIL_FROM_ADDRESS` | SMTP of the shop's mail provider |
| `SHOP_NOTIFICATION_EMAIL` | where new orders and leads are sent (also editable in Réglages) |
| `SEED_ADMIN_*`, `SEED_MANAGER_*` | first staff accounts, created on the first start; change the passwords afterwards in Utilisateurs |
| `SEED_RESELLER_PASSWORD` | not used in production (demo data is never seeded there) |
| `FILESYSTEM_DISK`, `AWS_*` | `public` (local volume) or `s3` |

## First deploy

```sh
git clone … climatisation-maroc && cd climatisation-maroc
cp .env.prod.example .env.prod && $EDITOR .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod build
docker run --rm -e APP_ROLE=worker climatisation-maroc/php:prod php artisan key:generate --show   # put it in APP_KEY
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker compose -f docker-compose.prod.yml logs -f php     # migrations, seeding, image download
node scripts/smoke.mjs https://climatisationmaroc.com     # from any machine with Node 22
```

The first start of `php` migrates, seeds the empty database (`APP_SEED=auto`: staff accounts,
reference data, catalogue, design content, home settings; no demo data) and downloads the
images, then caches config, routes, events and views (`php artisan optimize`).

Before opening the site: publish the legal pages (CGV and others) once their text is written, and
check the products flagged « À vérifier » in the back office.

## Updating

```sh
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod build
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Migrations run when `php` restarts; queue and scheduler restart with the new image. Run the smoke
test afterwards. Configuration changes in `.env.prod` need `up -d` (containers are recreated and
the config cache is rebuilt on start).

## Revalidation

After a back-office change, Laravel calls `http://next:3000/api/revalidate` with
`REVALIDATE_SECRET` so pages show the change at once (`docs/architecture.md`, Caching). The route
answers 403 without the secret. If pages keep showing old content, check that both services
received the same secret:

```sh
docker compose -f docker-compose.prod.yml exec next printenv REVALIDATE_SECRET
docker compose -f docker-compose.prod.yml exec php php artisan tinker --execute='var_dump(App\Support\Frontend\Revalidator::send());'
```

## Mail, queue and scheduler

E-mails are queued on Redis and sent by the `queue` service; failed jobs land in `failed_jobs`
(`php artisan queue:failed`, `queue:retry all`). The `scheduler` service runs `schedule:work`.
Logs go to stderr (`LOG_CHANNEL=stderr`): `docker compose -f docker-compose.prod.yml logs`.

## Backups

Back up the database and the `storage` volume daily, and keep copies off the server:

```sh
docker compose -f docker-compose.prod.yml exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction climatisation' | gzip > backup-$(date +%F).sql.gz
docker run --rm -v climatisation-maroc-prod_storage:/data -v "$PWD":/backup alpine tar czf /backup/storage-$(date +%F).tgz -C /data .
```

Restore with `gunzip -c backup.sql.gz | docker compose … exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" climatisation'`
and the reverse `tar xzf` into the volume. Redis holds only cache, queue and sessions.

## Health checks

`nginx` checks Laravel's `/up`, `next` its `/api/health`, `php` the fpm config; MySQL and Redis
have their own. `docker compose -f docker-compose.prod.yml ps` shows the state.
