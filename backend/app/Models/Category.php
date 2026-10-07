<?php

namespace App\Models;

use App\Enums\CategoryTemplate;
use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Catalogue category (tree). `path` is the full URL path ("climatisation/mural") and is kept in
 * sync with the parent chain on save.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string $slug
 * @property string $path
 * @property CategoryTemplate $template
 * @property bool $is_active
 */
class Category extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'template' => CategoryTemplate::class,
            'is_active' => 'boolean',
            'is_quote_only' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Category $category) {
            $parentPath = $category->parent_id ? static::query()->whereKey($category->parent_id)->value('path') : null;
            $category->path = $parentPath ? "{$parentPath}/{$category->slug}" : $category->slug;
        });

        // Children paths follow a renamed or moved parent.
        static::saved(function (Category $category) {
            if ($category->wasChanged('path')) {
                $category->children->each->save();
            }
        });
    }

    /** @return BelongsTo<Category, $this> */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /** @return HasMany<Category, $this> */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('position');
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * "Guides associés".
     *
     * @return MorphToMany<Article, $this, MorphPivot, 'pivot'>
     */
    public function articles(): MorphToMany
    {
        return $this->morphToMany(Article::class, 'linkable', 'article_links')->withPivot('position')->orderByPivot('position');
    }

    /** @param Builder<Category> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Categories visitors can see: active, and either a quote-only range (Froid) or holding at
     * least one published product in it or in a sub-category. An empty category (e.g. Chaudière
     * before its first product) is hidden from menus and links and its URL answers 404; it comes
     * back on its own when a product is published in it. The tree is two levels deep.
     *
     * @param  Builder<Category>  $query
     */
    public function scopePublic(Builder $query): void
    {
        $table = $query->getModel()->getTable();
        $query->where("{$table}.is_active", true)->where(fn (Builder $q) => $q
            ->where("{$table}.is_quote_only", true)
            ->orWhereExists(fn ($products) => $products->selectRaw('1')->from('products')
                ->where('products.is_published', true)
                ->where(fn ($w) => $w->whereColumn('products.category_id', "{$table}.id")
                    ->orWhereIn('products.category_id', fn ($sub) => $sub->select('sub.id')->from('categories as sub')
                        ->whereColumn('sub.parent_id', "{$table}.id")))));
    }

    /** Whether visitors can see this category (same rule as scopePublic). */
    public function isPublic(): bool
    {
        return static::query()->public()->whereKey($this->id)->exists();
    }

    /** @param Builder<Category> $query */
    public function scopeRoots(Builder $query): void
    {
        $query->whereNull('parent_id');
    }

    public function url(): string
    {
        return '/'.$this->path;
    }

    /**
     * Ids of this category and all its descendants (listings include sub-categories).
     *
     * @return list<int>
     */
    public function descendantIds(): array
    {
        $ids = [$this->id];
        foreach ($this->children()->get() as $child) {
            array_push($ids, ...$child->descendantIds());
        }

        return $ids;
    }
}
