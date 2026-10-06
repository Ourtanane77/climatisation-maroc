# Climatisation Maroc

Online store of Ariha Froid (HVAC distributor, Marrakech).

## Standing rules

- **Design files are the UI source of truth.** Use the 30 page files in
  `design/` (the two boards cover structure and navigation).
  `docs/design-inventory/` records their layout values and data. Reproduce the
  pages faithfully and do not redesign. Record any deliberate deviation in
  `docs/deviations.md`.
- **French only** (`lang="fr-MA"`).
- **Money and payment.** Prices are in Dhs and formatted `5 700 Dhs` (fr-FR
  grouping, non-breaking spaces). They are stored as integer centimes. There is
  no online payment: orders are cash on delivery.
- **Catalogue model.** Products are **families with variants**
  (`ProductVariant` holds the SKU, power in BTU, colour, prices, stock and
  images). A simple product has a single variant.
- **Never invent products, prices or content.**
  - `data/catalog.json` is the authority for products and prices: `price` is
    the regular price, `promo_price` the current selling price.
  - Design-only items are seeded with `needs_verification`.
  - Pages without real copy stay unpublished. Unpublished pages never appear
    in menus, the sitemap or internal link blocks.
- **Prices are always computed on the server.** A reseller sees the pro price
  where set; the public never does.
- The plan lives in `docs/plan.md`. Update it when a decision changes.
- **Never commit, push or create branches.** The owner commits. Leave changes
  in the working tree, run the tests and linters, and report what changed so
  the owner can review and commit.

## Stack

| Path | Contents |
|---|---|
| `backend/` | Laravel, REST API under `/api/v1`, Sanctum, Filament back office at `/admin` (French) |
| `frontend/` | Next.js App Router, TypeScript, Tailwind; server-rendered |
| `docker/` | nginx, php-fpm, queue worker, scheduler, mysql 8, redis, next, mailpit |
| `design/` | design reference (do not ship its scripts) |
| `docs/` | plan, inventory, deviations, guides |
| `data/` | `catalog.json` (real catalogue snapshot) |

## Commands

| Make target | What it does |
|---|---|
| `make up` | build and start the stack, run migrations and seeders |
| `make down` | stop the stack |
| `make migrate` | `php artisan migrate` |
| `make seed` | `php artisan db:seed` |
| `make fresh` | `migrate:fresh --seed` |
| `make test` | backend Pest and frontend Vitest |
| `make lint` | Pint, Larastan, ESLint, tsc |
| `make logs` | follow the stack logs |
| `make sh-php` | shell in the php container |
| `make sh-next` | shell in the next container |

Without `make` (Windows shell), run the same `docker compose …` commands
listed in the `Makefile`.

Local URLs:
- site: http://localhost:8080
- back office: http://localhost:8080/admin
- Mailpit: http://localhost:8025
