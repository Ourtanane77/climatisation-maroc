<?php

namespace App\Models;

use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $logo
 * @property bool $is_official_distributor
 */
class Brand extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'logo_aspect' => 'float',
            'is_official_distributor' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /** @param Builder<Brand> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function url(): string
    {
        return '/marques/'.$this->slug;
    }
}
