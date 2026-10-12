<?php

namespace App\Http\Controllers\Api\Products;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Support\Api\ImageUrl;
use App\Support\Api\SeoData;
use App\Support\Catalog\SiteCatalog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

/** Small shared shapes for the product, compare and brand endpoints (camelCase, like the front-end types). */
class Present
{
    /** Relations needed by ProductCardResource. */
    public const CARD_WITH = ['variants', 'images', 'brand'];

    /** @return array{name: string, slug: string, href: string, logo: string|null, logoAspect: float|null, caption: string|null, official: bool} */
    public static function brand(Brand $brand): array
    {
        return [
            'name' => $brand->name,
            'slug' => $brand->slug,
            'href' => $brand->url(),
            'logo' => ImageUrl::logo($brand->logo),
            'logoAspect' => $brand->logo_aspect !== null ? (float) $brand->logo_aspect : null,
            'caption' => $brand->siteText('caption'),
            'official' => $brand->is_official_distributor,
        ];
    }

    /** @return array{label: string, href: string} */
    public static function category(Category $category): array
    {
        return ['label' => (string) $category->siteText('name'), 'href' => $category->url()];
    }

    /**
     * Breadcrumb from the home page down to (and including) the category.
     *
     * @return list<array{label: string, href?: string}>
     */
    public static function categoryTrail(Category $category): array
    {
        $trail = [];
        for ($c = $category; $c; $c = $c->parent) {
            array_unshift($trail, self::category($c));
        }

        return [['label' => 'Accueil', 'href' => '/'], ...$trail];
    }

    /**
     * SEO fields of a page for the current site (per-site overrides first).
     *
     * @return array{title: string|null, description: string|null, h1: string|null, canonical: string|null, ogImage: string|null, noindex: bool}
     */
    public static function seo(Model $owner): array
    {
        return [
            'title' => SeoData::title($owner),
            'description' => SeoData::description($owner),
            'h1' => SeoData::h1($owner),
            'canonical' => SeoData::canonical($owner),
            'ogImage' => ImageUrl::path($owner->getAttribute('seo')?->og_image),
            'noindex' => SeoData::noindex($owner),
        ];
    }

    /**
     * Products visible on the current site with everything a card needs.
     *
     * @return Builder<Product>
     */
    public static function cardQuery(): Builder
    {
        return Product::query()->where(SiteCatalog::products(...))
            ->whereHas('variants')
            ->with([
                'variants',
                'images' => fn (Relation $q) => $q->whereNotNull('path'),
                'brand',
            ]);
    }
}
