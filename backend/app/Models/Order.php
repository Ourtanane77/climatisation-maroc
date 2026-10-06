<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * Cash-on-delivery order. Lines are snapshots (name, SKU, unit price at order time).
 *
 * @property int $id
 * @property string $reference
 * @property OrderStatus $status
 * @property int $subtotal
 * @property int $total
 */
class Order extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['access_token'];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'status_changed_at' => 'datetime',
            'option_technical_visit' => 'boolean',
            'option_installation_quote' => 'boolean',
        ];
    }

    /** @return HasMany<OrderLine, $this> */
    public function lines(): HasMany
    {
        return $this->hasMany(OrderLine::class);
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function history(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Next reference for the current year: CM-2026-00001, CM-2026-00002…
     * Call inside a transaction; the row lock serialises concurrent checkouts.
     */
    public static function nextReference(?int $year = null): string
    {
        $year ??= (int) now()->format('Y');
        $prefix = "CM-{$year}-";
        $last = static::query()->where('reference', 'like', $prefix.'%')->lockForUpdate()->max('reference');
        $number = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix.str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }

    /** Moves the order to a new status, recording who did it. */
    public function transitionTo(OrderStatus $status, ?User $by = null, ?string $note = null): void
    {
        DB::transaction(function () use ($status, $by, $note) {
            $this->update(['status' => $status, 'status_changed_at' => now()]);
            $this->history()->create(['status' => $status->value, 'user_id' => $by?->id, 'note' => $note]);
        });
    }
}
