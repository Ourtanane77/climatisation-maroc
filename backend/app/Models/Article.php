<?php

namespace App\Models;

use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Blog article. `body` holds Filament Builder blocks [{type, data}]: paragraph, h2, h3, callout,
 * tip, figure, calculator, power_table, products.
 */
class Article extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'body' => 'array',
            'published_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }

    /** @return BelongsTo<ArticleCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'article_category_id');
    }

    /** @return MorphToMany<Category, $this> */
    public function linkedCategories(): MorphToMany
    {
        return $this->morphedByMany(Category::class, 'linkable', 'article_links');
    }

    /** @return MorphToMany<Product, $this> */
    public function linkedProducts(): MorphToMany
    {
        return $this->morphedByMany(Product::class, 'linkable', 'article_links');
    }

    /** @return MorphToMany<SectorPage, $this> */
    public function linkedSectors(): MorphToMany
    {
        return $this->morphedByMany(SectorPage::class, 'linkable', 'article_links');
    }

    /** @param Builder<Article> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function url(): string
    {
        return '/blog/'.$this->slug;
    }
}
