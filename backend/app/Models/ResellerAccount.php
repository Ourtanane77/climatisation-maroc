<?php

namespace App\Models;

use App\Enums\ResellerStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property ResellerStatus $status
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
