<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Production-safe seeding: every seeder is idempotent (updateOrCreate on natural keys).
 * Demo data (example order, reseller, lead) is only added outside production.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndUsersSeeder::class,
            ReferenceSeeder::class,
            CatalogSeeder::class,
            ContentSeeder::class,
            HomeSeeder::class,
        ]);

        if (! app()->isProduction()) {
            $this->call(DemoSeeder::class);
        }
    }
}
