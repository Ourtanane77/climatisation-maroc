<?php

namespace App\Models;

use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

/** Sector page of "Solutions professionnelles" (template: design/Restaurants.dc.html). */
class SectorPage extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'problems' => 'array',
            'solutions' => 'array',
            'range_tiles' => 'array',
            'image_band' => 'array',
            'is_published' => 'boolean',
        ];
    }

    /**
     * "Produits recommandés".
     *
     * @return BelongsToMany<Product, $this, Pivot, 'pivot'>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'sector_page_product')->withPivot('position')->orderByPivot('position');
    }

    /** @return MorphToMany<Article, $this, MorphPivot, 'pivot'> */
    public function articles(): MorphToMany
    {
        return $this->morphToMany(Article::class, 'linkable', 'article_links')->withPivot('position')->orderByPivot('position');
    }

    /** @param Builder<SectorPage> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function url(): string
    {
        return '/solutions/'.$this->slug;
    }
}
