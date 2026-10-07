<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Roles and the two staff accounts (SEED_ADMIN_* and SEED_MANAGER_*). Safe to re-run: roles and users
 * are created only when missing, an existing user keeps their password and gets their role back.
 * A missing e-mail or password stops the seed with a clear message (no silent skip).
 */
class RolesAndUsersSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ([User::ROLE_ADMIN, User::ROLE_MANAGER, User::ROLE_RESELLER] as $role) {
            Role::findOrCreate($role, 'web');
        }

        $staff = [
            ['SEED_ADMIN', config('shop.seed.admin_email'), config('shop.seed.admin_password'), 'Administrateur', User::ROLE_ADMIN],
            ['SEED_MANAGER', config('shop.seed.manager_email'), config('shop.seed.manager_password'), 'Gestionnaire', User::ROLE_MANAGER],
        ];

        // One person can hold both: the same e-mail for admin and manager keeps the admin account only.
        if ($staff[0][1] && $staff[0][1] === $staff[1][1]) {
            unset($staff[1]);
        }

        foreach ($staff as [$key, $email, $password, $name, $role]) {
            if (! $email || ! $password) {
                $missing = ! $email ? "{$key}_EMAIL" : "{$key}_PASSWORD";
                throw new RuntimeException("{$missing} est vide : renseignez-le dans les variables d’environnement (.env / Coolify), puis relancez « php artisan db:seed --class=RolesAndUsersSeeder --force ».");
            }
            // Production never gets a staff account with a development or short password.
            if (app()->isProduction() && (str_starts_with((string) $password, 'change-me') || mb_strlen((string) $password) < 12)) {
                throw new RuntimeException("Mot de passe trop faible pour {$email} : renseignez SEED_*_PASSWORD (12 caractères minimum) dans .env.prod.");
            }

            $user = User::query()->firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => $password],
            );
            $user->syncRoles([$role]);
        }
    }
}
