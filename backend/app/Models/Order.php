<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Support\Sites\Sites;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Order, paid on delivery or online by card (CMI). Lines are snapshots (name, SKU, unit price at order time).
 *
 * @property int $id
 * @property string $site
 * @property string $reference
 * @property OrderStatus $status
 * @property PaymentMethod $payment_method
 * @property PaymentStatus|null $payment_status
 * @property Carbon|null $paid_at
 * @property string|null $payment_transaction_id
 * @property string $access_token
 * @property string|null $email
 * @property string|null $city_name
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
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'paid_at' => 'datetime',
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

    /** @return HasMany<OrderPayment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class)->latest('id');
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

    /** The storefront the order was placed on: the current site unless set. */
    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->site ??= Sites::currentKey();
        });
    }

    /**
     * Orders placed on a site (default: the current one).
     *
     * @param  Builder<Order>  $query
     */
    public function scopeOnSite(Builder $query, ?string $site = null): void
    {
        $query->where($query->qualifyColumn('site'), $site ?? Sites::currentKey());
    }

    /**
     * Next reference for the current year on a site (default: the current one), numbered per
     * prefix: CM-2026-00001, CM-2026-00002… on Climatisation Maroc, AR-2026-00001… on Arfro.
     * Call inside a transaction; the row lock serialises concurrent checkouts.
     */
    public static function nextReference(?int $year = null, ?string $site = null): string
    {
        $year ??= (int) now()->format('Y');
        $prefix = Sites::get($site ?? Sites::currentKey())->orderPrefix."-{$year}-";
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
