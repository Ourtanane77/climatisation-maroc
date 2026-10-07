<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndUsersSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ([User::ROLE_ADMIN, User::ROLE_MANAGER, User::ROLE_RESELLER] as $role) {
            Role::findOrCreate($role, 'web');
        }

        $staff = [
            [config('shop.seed.admin_email'), config('shop.seed.admin_password'), 'Administrateur', User::ROLE_ADMIN],
            [config('shop.seed.manager_email'), config('shop.seed.manager_password'), 'Gestionnaire', User::ROLE_MANAGER],
        ];

        foreach ($staff as [$email, $password, $name, $role]) {
            if (! $email || ! $password) {
                continue;
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
