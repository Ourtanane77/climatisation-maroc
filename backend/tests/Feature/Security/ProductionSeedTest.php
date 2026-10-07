<?php

use Database\Seeders\RolesAndUsersSeeder;

it('refuses development staff passwords in production', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['shop.seed.admin_email' => 'admin@example.ma', 'shop.seed.admin_password' => 'change-me-admin']);

    expect(fn () => (new RolesAndUsersSeeder)->run())->toThrow(RuntimeException::class, 'Mot de passe trop faible');
});

it('accepts a strong staff password in production', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['shop.seed.admin_email' => 'admin@example.ma', 'shop.seed.admin_password' => 'A-strong-passphrase-2026', 'shop.seed.manager_email' => null]);

    (new RolesAndUsersSeeder)->run();

    expect(App\Models\User::query()->where('email', 'admin@example.ma')->exists())->toBeTrue();
});
