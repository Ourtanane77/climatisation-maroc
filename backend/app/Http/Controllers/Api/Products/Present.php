<?php

namespace App\Http\Controllers\Api\Products;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\SeoMeta;
use App\Support\Api\ImageUrl;
use Illuminate\Database\Eloquent\Builder;
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
            'logo' => ImageUrl::path($brand->logo),
            'logoAspect' => $brand->logo_aspect !== null ? (float) $brand->logo_aspect : null,
            'caption' => $brand->caption,
            'official' => $brand->is_official_distributor,
        ];
    }

    /** @return array{label: string, href: string} */
    public static function category(Category $category): array
    {
        return ['label' => $category->name, 'href' => $category->url()];
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

    /** @return array{title: string|null, description: string|null, h1: string|null, canonical: string|null, ogImage: string|null, noindex: bool} */
    public static function seo(?SeoMeta $seo): array
    {
        return [
            'title' => $seo?->title,
            'description' => $seo?->description,
            'h1' => $seo?->h1,
            'canonical' => $seo?->canonical,
            'ogImage' => ImageUrl::path($seo?->og_image),
            'noindex' => (bool) $seo?->noindex,
        ];
    }

    /**
     * Published products with everything a card needs.
     *
     * @return Builder<Product>
     */
    public static function cardQuery(): Builder
    {
        return Product::query()->published()
            ->whereHas('variants')
            ->with([
                'variants',
                'images' => fn (Relation $q) => $q->whereNotNull('path'),
                'brand',
            ]);
    }
}
