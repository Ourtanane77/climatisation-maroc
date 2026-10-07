<?php

use App\Models\User;
use Database\Seeders\RolesAndUsersSeeder;
use Illuminate\Support\Facades\Hash;

it('refuses development staff passwords in production', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['shop.seed.admin_email' => 'admin@example.ma', 'shop.seed.admin_password' => 'change-me-admin']);

    expect(fn () => (new RolesAndUsersSeeder)->run())->toThrow(RuntimeException::class, 'Mot de passe trop faible');
});

it('accepts a strong staff password in production', function () {
    app()->detectEnvironment(fn () => 'production');
    config([
        'shop.seed.admin_email' => 'admin@example.ma', 'shop.seed.admin_password' => 'A-strong-passphrase-2026',
        'shop.seed.manager_email' => 'gestion@example.ma', 'shop.seed.manager_password' => 'Another-strong-pass-2026',
    ]);

    (new RolesAndUsersSeeder)->run();

    expect(User::query()->where('email', 'admin@example.ma')->exists())->toBeTrue();
});

it('stops with a clear message when a staff e-mail is empty', function () {
    config(['shop.seed.manager_email' => '']);

    expect(fn () => (new RolesAndUsersSeeder)->run())->toThrow(RuntimeException::class, 'SEED_MANAGER_EMAIL est vide');
});

it('creates missing staff accounts when the roles already exist, and keeps changed passwords', function () {
    (new RolesAndUsersSeeder)->run();
    User::query()->whereIn('email', [config('shop.seed.admin_email'), config('shop.seed.manager_email')])->delete();

    // Roles exist, users are recreated with their role.
    (new RolesAndUsersSeeder)->run();
    $admin = User::query()->where('email', config('shop.seed.admin_email'))->firstOrFail();
    expect($admin->hasRole(User::ROLE_ADMIN))->toBeTrue();

    // A password changed in the back office survives a re-run.
    $admin->update(['password' => 'Changed-in-the-back-office-2026']);
    (new RolesAndUsersSeeder)->run();
    expect(Hash::check('Changed-in-the-back-office-2026', $admin->fresh()->password))->toBeTrue()
        ->and(User::query()->where('email', config('shop.seed.admin_email'))->count())->toBe(1);
});

it('keeps a single admin account when admin and manager share the same e-mail', function () {
    config(['shop.seed.admin_email' => 'ecom@example.ma', 'shop.seed.manager_email' => 'ecom@example.ma']);

    (new RolesAndUsersSeeder)->run();

    $user = User::query()->where('email', 'ecom@example.ma')->sole();
    expect($user->hasRole(User::ROLE_ADMIN))->toBeTrue()->and($user->hasRole(User::ROLE_MANAGER))->toBeFalse();
});
