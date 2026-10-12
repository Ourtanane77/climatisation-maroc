<?php

namespace App\Models;

use App\Enums\ResellerStatus;
use App\Support\Sites\Sites;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property ResellerStatus $status
 * @property string $site
 * @property-read User $user
 */
class ResellerAccount extends Model
{
    /** Options of the "Activité" select (design/Devenir revendeur.dc.html). */
    public const ACTIVITIES = [
        'installateur' => 'Installateur',
        'revendeur' => 'Revendeur',
        'bureau_etudes' => 'Bureau d’études',
        'promoteur' => 'Promoteur',
        'autre' => 'Autre',
    ];

    protected $guarded = ['id'];

    /** The storefront the application was sent from: the current site unless set (its e-mails use it). */
    protected static function booted(): void
    {
        static::creating(function (ResellerAccount $account) {
            $account->site ??= Sites::currentKey();
        });
    }

    protected function casts(): array
    {
        return [
            'status' => ResellerStatus::class,
            'decided_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /** @return BelongsTo<User, $this> */
    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    public function isValidated(): bool
    {
        return $this->status === ResellerStatus::Valide;
    }
}
