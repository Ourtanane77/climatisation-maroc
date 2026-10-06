<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Seeds the database on first start only (used by the container entrypoint with APP_SEED=auto),
 * so `make up` brings up a usable stack without wiping data on later restarts.
 */
#[Signature('app:seed-if-empty')]
#[Description('Run the database seeders when the database has no users yet')]
class SeedIfEmpty extends Command
{
    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->components->info('Database already seeded, skipping.');

            return self::SUCCESS;
        }

        $this->components->info('Empty database: seeding.');

        return $this->call('db:seed', ['--force' => true]);
    }
}
