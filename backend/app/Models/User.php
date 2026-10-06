<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser
{
    /** Back-office roles. Resellers use the front office only. */
    public const ROLE_ADMIN = 'admin';

    public const ROLE_MANAGER = 'gestionnaire';

    public const ROLE_RESELLER = 'revendeur';

    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** @return HasOne<ResellerAccount, $this> */
    public function resellerAccount(): HasOne
    {
        return $this->hasOne(ResellerAccount::class);
    }

    /** True for a reseller whose account has been validated: sees pro prices, can log in. */
    public function isValidatedReseller(): bool
    {
        return $this->hasRole(self::ROLE_RESELLER) && (bool) $this->resellerAccount?->isValidated();
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->hasAnyRole([self::ROLE_ADMIN, self::ROLE_MANAGER]);
    }
}
