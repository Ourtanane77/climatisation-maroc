# Climatisation Maroc

Online store of Ariha Froid, HVAC distributor in Marrakech since 2008: air conditioners, water
heaters, ventilation, ducts, copper and gas, spare parts. French only, prices in Dhs, cash on
delivery, free delivery across Morocco, reseller prices for validated professionals.

- **Front office:** Next.js 16 (App Router, TypeScript, Tailwind), server-rendered.
- **API and back office:** Laravel 13, Filament 5 (`/admin`, in French), Sanctum.
- **Infrastructure:** MySQL 8, Redis, Docker (nginx, php-fpm, queue, scheduler, next, mailpit).

## Quick start

```sh
cp .env.example .env && cp backend/.env.example backend/.env
make up
docker compose exec php php artisan key:generate && make cache
```

Site http://localhost:8080 · back office http://localhost:8080/admin · Mailpit http://localhost:8025

## Documentation

| Document | For |
|---|---|
| [docs/setup.md](docs/setup.md) | development setup, make targets, tests, Windows notes |
| [docs/architecture.md](docs/architecture.md) | how the parts fit: API domains, BFF, pricing, caching, images |
| [docs/deployment.md](docs/deployment.md) | production stack, environment, first deploy, updates, backups |
| [docs/guide-back-office.md](docs/guide-back-office.md) | guide du back-office (en français, pour l'équipe) |
| [docs/plan.md](docs/plan.md) | implementation plan and decisions |
| [docs/deviations.md](docs/deviations.md) | deliberate differences from the design |
| [CLAUDE.md](CLAUDE.md) | standing rules for contributors and coding agents |

The UI source of truth is the Claude Design export in `design/`; `data/catalog.json` is the
catalogue and price authority.
