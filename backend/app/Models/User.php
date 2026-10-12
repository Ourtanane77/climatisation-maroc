<?php

namespace App\Models;

use App\Support\Sites\Sites;
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

#[Fillable(['name', 'email', 'phone', 'password', 'sites'])]
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
            'sites' => 'array',
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

    /**
     * Sites this back-office user manages: their orders, leads, resellers and content. `sites`
     * null or empty = every site (and admins always manage every site).
     *
     * @return list<string>
     */
    public function managedSites(): array
    {
        if ($this->hasRole(self::ROLE_ADMIN) || empty($this->sites)) {
            return Sites::keys();
        }

        return array_values(array_intersect(Sites::keys(), (array) $this->sites));
    }

    public function managesSite(string $site): bool
    {
        return in_array($site, $this->managedSites(), true);
    }

    /** True when the user manages every site (no per-site restriction applies). */
    public function managesAllSites(): bool
    {
        return count($this->managedSites()) === count(Sites::keys());
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->hasAnyRole([self::ROLE_ADMIN, self::ROLE_MANAGER]);
    }
}
