<?php

namespace App\Support\Blog;

use App\Http\Resources\ProductCardResource;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use Illuminate\Support\Collection;

/**
 * Blog view models (design/Blog.dc.html, Blog categorie.dc.html, Article puissance
 * climatiseur.dc.html). Only published articles reach these methods.
 */
class ArticlePresenter
{
    /** @return array<string, mixed> article card (ArticleCard / FeaturedArticle) */
    public static function card(Article $article): array
    {
        return [
            'title' => $article->title,
            'slug' => $article->slug,
            'href' => $article->url(),
            'excerpt' => $article->excerpt,
            'category' => $article->category ? self::category($article->category) : null,
            'readingTime' => $article->reading_time,
            'cover' => ImageUrl::path($article->cover),
            'art' => $article->art_key,
            'bg' => $article->cover_bg,
        ];
    }

    /** @return array{name: string, slug: string, href: string, description: string|null} */
    public static function category(ArticleCategory $category): array
    {
        return [
            'name' => $category->name,
            'slug' => $category->slug,
            'href' => $category->url(),
            'description' => $category->description,
        ];
    }

    /**
     * Body blocks for the front office: Builder blocks [{type, data}] flattened to {type, …data},
     * with product references resolved to live, published products (unknown ones are dropped).
     *
     * @return list<array<string, mixed>>
     */
    public static function blocks(Article $article): array
    {
        $blocks = [];
        foreach ($article->body ?? [] as $block) {
            $type = $block['type'] ?? null;
            $data = $block['data'] ?? [];
            $out = match ($type) {
                'paragraph', 'h3' => ['text' => (string) ($data['text'] ?? '')],
                'h2' => ['text' => (string) ($data['text'] ?? ''), 'id' => $data['id'] ?? null],
                'callout' => ['title' => $data['title'] ?? 'En bref', 'items' => array_values($data['items'] ?? [])],
                'tip' => ['title' => $data['title'] ?? 'Astuce', 'text' => (string) ($data['text'] ?? '')],
                'figure' => self::figure($data),
                'calculator', 'power_table' => [],
                'products' => ['items' => self::products($data['skus'] ?? [])],
                default => null,
            };
            if ($out === null || ($type === 'products' && ! $out['items'])) {
                continue;
            }
            $blocks[] = ['type' => $type] + $out;
        }

        return $blocks;
    }

    /**
     * Table of contents: the H2 blocks that have an anchor.
     *
     * @param  list<array<string, mixed>>  $blocks
     * @return list<array{id: string, text: string}>
     */
    public static function toc(array $blocks): array
    {
        return array_values(array_map(
            fn (array $b) => ['id' => (string) $b['id'], 'text' => (string) $b['text']],
            array_filter($blocks, fn (array $b) => $b['type'] === 'h2' && ! empty($b['id'])),
        ));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function figure(array $data): array
    {
        $variant = ! empty($data['product_sku']) ? self::variants([$data['product_sku']])->first() : null;

        return [
            'image' => $variant ? ImageUrl::for(ProductCardResource::imageFor($variant->product, $variant), 1200) : null,
            'art' => $variant?->product->art_key,
            'dark' => $variant?->colour === 'Noir',
            'alt' => $data['alt'] ?? ($variant?->displayName() ?? ''),
            'caption' => $data['caption'] ?? null,
        ];
    }

    /**
     * Inline product cards: one variant each (name with its power, price, struck regular price).
     *
     * @param  list<string>  $skus
     * @return list<array<string, mixed>>
     */
    private static function products(array $skus): array
    {
        $reseller = Audience::isReseller();

        return self::variants($skus)->map(fn (ProductVariant $v) => [
            'name' => $v->displayName(),
            'sku' => $v->sku,
            'href' => $v->product->url().($v->product->variants->count() > 1 ? '?v='.rawurlencode($v->sku) : ''),
            'price' => $v->priceFor($reseller),
            'regularPrice' => ProductCardResource::discount($v, $reseller) > 0 ? $v->price : null,
            'image' => ImageUrl::for(ProductCardResource::imageFor($v->product, $v), 320),
            'art' => $v->product->art_key,
            'dark' => $v->colour === 'Noir',
            'inStock' => $v->stock_status->isOrderable(),
        ])->values()->all();
    }

    /**
     * Variants of published products, in the given SKU order.
     *
     * @param  list<string>  $skus
     * @return Collection<int, ProductVariant>
     */
    private static function variants(array $skus): Collection
    {
        $found = ProductVariant::query()->whereIn('sku', $skus)
            ->whereHas('product', fn ($q) => $q->published())
            ->with(['product.images', 'product.variants'])
            ->get()->keyBy('sku');

        return collect($skus)->map(fn (string $sku) => $found->get($sku))->filter()->values();
    }
}
