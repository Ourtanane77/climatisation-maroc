<?php

namespace App\Models;

use App\Enums\StockStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Sellable unit: SKU, power, colour, prices (centimes), stock.
 * `price` is the regular price; `promo_price`, when set and lower, is the selling price.
 * `pro_price` is only ever exposed to validated resellers.
 *
 * @property int $id
 * @property int $product_id
 * @property string $sku
 * @property string|null $label
 * @property int|null $power_btu
 * @property string|null $colour
 * @property int $price
 * @property int|null $promo_price
 * @property int|null $pro_price
 * @property StockStatus $stock_status
 * @property bool $needs_verification
 * @property-read Product $product
 */
class ProductVariant extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'stock_status' => StockStatus::class,
            'is_default' => 'boolean',
            'needs_verification' => 'boolean',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    /** @return HasMany<ProductSpec, $this> */
    public function specs(): HasMany
    {
        return $this->hasMany(ProductSpec::class)->orderBy('position');
    }

    public function isDiscounted(): bool
    {
        return $this->promo_price !== null && $this->promo_price < $this->price;
    }

    /** Public selling price, centimes. */
    public function sellingPrice(): int
    {
        return $this->isDiscounted() ? (int) $this->promo_price : $this->price;
    }

    /** Price for the given audience: resellers get the pro price where one is set. */
    public function priceFor(bool $reseller): int
    {
        if ($reseller && $this->pro_price !== null) {
            return min($this->pro_price, $this->sellingPrice());
        }

        return $this->sellingPrice();
    }

    public function displayName(): string
    {
        return trim($this->product->name.' '.($this->label ?? ''));
    }
}
