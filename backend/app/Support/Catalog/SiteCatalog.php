<?php

namespace App\Support\Catalog;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Support\Sites\Sites;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * What the current storefront shows (config/sites.php, App\Models\Concerns\HasSites). Every public
 * read of the API goes through these constraints instead of the bare published()/active()/public()
 * scopes, so a record hidden on a site behaves there like an unpublished one:
 *
 * - a product is shown when it is published and on the site, and so are its category (with the
 *   category's parent) and its brand (when it has one);
 * - a category is shown when it is on the site and so is its parent;
 * - editorial records (articles, pages, sector/service/city pages) when published and on the site.
 *
 * Each method is a nested-where constraint usable anywhere a query or relation takes a closure:
 * `Product::query()->where(SiteCatalog::products(...))`, `whereHas('product', SiteCatalog::products(...))`,
 * `$sector->products()->where(SiteCatalog::products(...))`.
 */
final class SiteCatalog
{
    /**
     * Products visible on the current site (published, on the site, category and brand on it too).
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     */
    public static function products(Builder $query): void
    {
        $site = Sites::currentKey();
        $brandId = $query->qualifyColumn('brand_id');

        $query->where($query->qualifyColumn('is_published'), true)
            ->whereJsonContains($query->qualifyColumn('sites'), $site)
            ->whereIn($query->qualifyColumn('category_id'), Category::query()->select('categories.id')->where(self::categories(...)))
            ->where(fn (Builder $b) => $b->whereNull($brandId)
                ->orWhereIn($brandId, Brand::query()->select('brands.id')->whereJsonContains('brands.sites', $site)));
    }

    /**
     * Categories on the current site, with their parent on it too (active or not: see publicCategories).
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     */
    public static function categories(Builder $query): void
    {
        $site = Sites::currentKey();
        $parent = $query->qualifyColumn('parent_id');

        $query->whereJsonContains($query->qualifyColumn('sites'), $site)
            ->where(fn (Builder $w) => $w->whereNull($parent)
                ->orWhereIn($parent, fn (QueryBuilder $p) => $p->select('cp.id')->from('categories as cp')->whereJsonContains('cp.sites', $site)));
    }

    /**
     * Category::scopePublic on the current site: active, on the site, and either quote-only or
     * holding a product visible on the site (in it or in a sub-category).
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     */
    public static function publicCategories(Builder $query): void
    {
        $id = $query->qualifyColumn('id');
        $stocked = Product::query()->select('products.category_id')->where(self::products(...));

        $query->where($query->qualifyColumn('is_active'), true)
            ->where(self::categories(...))
            ->where(fn (Builder $w) => $w->where($query->qualifyColumn('is_quote_only'), true)
                ->orWhereIn($id, $stocked)
                ->orWhereIn($id, Category::query()->select('categories.parent_id')->whereIn('categories.id', $stocked)));
    }

    /**
     * Active brands on the current site.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     */
    public static function brands(Builder $query): void
    {
        $query->where($query->qualifyColumn('is_active'), true)
            ->whereJsonContains($query->qualifyColumn('sites'), Sites::currentKey());
    }

    /**
     * Published editorial records on the current site (articles, pages, sector, service and city pages).
     *
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     */
    public static function published(Builder $query): void
    {
        $query->where($query->qualifyColumn('is_published'), true)
            ->whereJsonContains($query->qualifyColumn('sites'), Sites::currentKey());
    }

    public static function isProductVisible(Product $product): bool
    {
        return Product::query()->whereKey($product->id)->where(self::products(...))->exists();
    }

    public static function isCategoryPublic(Category $category): bool
    {
        return Category::query()->whereKey($category->id)->where(self::publicCategories(...))->exists();
    }
}
