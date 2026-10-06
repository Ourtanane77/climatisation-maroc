<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Production-safe seeding: every seeder is idempotent (updateOrCreate on natural keys).
 * Demo data (example orders, leads) lives in DemoSeeder and is never run here.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndUsersSeeder::class,
        ]);
    }
}
