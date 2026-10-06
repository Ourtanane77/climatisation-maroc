<?php

namespace App\Models;

use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * A product family (e.g. "LG Dual Inverter") with its variants (9 000 / 12 000 / 18 000 / 24 000 BTU).
 * A simple product has a single variant.
 *
 * @property int $id
 * @property int $category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string $slug
 * @property bool $is_published
 * @property bool $needs_verification
 * @property-read Collection<int, ProductVariant> $variants
 */
class Product extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'highlights' => 'array',
            'is_new' => 'boolean',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'needs_verification' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Brand, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** @return HasMany<ProductVariant, $this> */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('position');
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    /** @return HasMany<ProductSpec, $this> */
    public function specs(): HasMany
    {
        return $this->hasMany(ProductSpec::class)->whereNull('product_variant_id')->orderBy('position');
    }

    /**
     * Products suggested "pour l'installation".
     *
     * @return BelongsToMany<Product, $this, Pivot, 'pivot'>
     */
    public function accessories(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_accessories', 'product_id', 'accessory_id')
            ->withPivot('position')
            ->orderByPivot('position');
    }

    /** @return MorphToMany<Article, $this, MorphPivot, 'pivot'> */
    public function articles(): MorphToMany
    {
        return $this->morphToMany(Article::class, 'linkable', 'article_links')->withPivot('position')->orderByPivot('position');
    }

    /** @param Builder<Product> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /**
     * Families flagged "à vérifier", or with at least one flagged variant.
     *
     * @param  Builder<Product>  $query
     */
    public function scopeNeedsVerification(Builder $query): void
    {
        $query->where(fn (Builder $q) => $q->where('needs_verification', true)
            ->orWhereHas('variants', fn (Builder $v) => $v->where('needs_verification', true)));
    }

    public function url(): string
    {
        return '/produit/'.$this->slug;
    }

    /** Lowest public selling price among variants (centimes), for "À partir de". */
    public function fromPrice(): ?int
    {
        return $this->variants->map(fn (ProductVariant $v) => $v->sellingPrice())->min();
    }

    public function isOnPromotion(): bool
    {
        return $this->variants->contains(fn (ProductVariant $v) => $v->isDiscounted());
    }
}
