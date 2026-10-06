<?php

namespace App\Models;

use App\Enums\LeadStatus;
use App\Enums\LeadType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Form submission: quote request, contact message, reseller application, sector quote, stock alert.
 *
 * @property LeadType $type
 * @property LeadStatus $status
 */
class Lead extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'type' => LeadType::class,
            'status' => LeadStatus::class,
            'payload' => 'array',
        ];
    }

    /**
     * Page the form was sent from (sector page…).
     *
     * @return MorphTo<Model, $this>
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
