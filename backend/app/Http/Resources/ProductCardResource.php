<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product family as a listing card: the front-end `ProductCardData` (frontend/src/lib/types.ts).
 * Prices are centimes and follow the audience (pro price for a validated reseller).
 * Eager-load `variants`, `images` and `brand` before using it on a collection.
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        /** @var Product $product */
        $product = $this->resource;
        $reseller = Audience::isReseller();
        $variants = $product->variants;
        $single = $variants->count() === 1 ? $variants->first() : null;
        $first = $single ?? $variants->first();
        // « À partir de » the lowest real price: variants « sur demande » (price 0) are left out
        // unless every variant is on request.
        $priced = $variants->reject(fn (ProductVariant $v) => $v->isOnRequest());
        $cheapest = ($priced->isNotEmpty() ? $priced : $variants)->sortBy(fn (ProductVariant $v) => $v->priceFor($reseller))->first();
        $maxDiscount = $variants->map(fn (ProductVariant $v) => self::discount($v, $reseller))->max() ?? 0;

        return [
            'name' => $product->name,
            'href' => $product->url(),
            'brand' => $product->brand?->name,
            'sku' => $single?->sku,
            'refText' => $single ? null : self::refText($variants->all()),
            'price' => $cheapest?->priceFor($reseller) ?? 0,
            'regularPrice' => $single && self::discount($single, $reseller) > 0 ? $single->price : null,
            'fromPrice' => ! $single && $priced->isNotEmpty(),
            'onRequest' => $priced->isEmpty(),
            'image' => ImageUrl::for(self::imageFor($product, $first)),
            'imageSrcSet' => ImageUrl::srcSet(self::imageFor($product, $first)),
            'imageAlt' => $product->name,
            'art' => $product->art_key,
            'dark' => $first?->colour === 'Noir',
            'badge' => $maxDiscount > 0 ? ['text' => "\u{2212}{$maxDiscount}\u{00A0}%", 'tone' => 'promo'] : null,
            // A single variant still gets its power chip ("18K"), as drawn on Promotions.
            'options' => $single && ! $single->power_btu ? [] : $variants->map(fn (ProductVariant $v) => [
                'label' => self::shortLabel($v),
                'fullLabel' => $v->label ?? $v->sku,
                'sku' => $v->sku,
                'price' => $v->priceFor($reseller),
                'regularPrice' => self::discount($v, $reseller) > 0 ? $v->price : null,
                'image' => ImageUrl::for(self::imageFor($product, $v)),
                'imageSrcSet' => ImageUrl::srcSet(self::imageFor($product, $v)),
                'dark' => $v->colour === 'Noir',
                'onRequest' => $v->isOnRequest(),
            ])->values()->all(),
            'inStock' => $variants->contains(fn (ProductVariant $v) => $v->stock_status->isOrderable()),
        ];
    }

    /** Discount in whole percent shown on the badge (design: "−13 %"). */
    public static function discount(ProductVariant $variant, bool $reseller = false): int
    {
        $price = $variant->priceFor($reseller);

        return $variant->price > 0 && $price < $variant->price
            ? (int) round(($variant->price - $price) * 100 / $variant->price)
            : 0;
    }

    /** Chip label: "9K" for powers (design), else the variant label ("50 L", "Ø 125", "Noir"). */
    public static function shortLabel(ProductVariant $variant): string
    {
        if ($variant->power_btu) {
            $label = intdiv($variant->power_btu, 1000).'K';

            return $variant->colour ? "{$label} {$variant->colour}" : $label;
        }

        return $variant->label ?? $variant->sku;
    }

    /** @param list<ProductVariant> $variants */
    public static function refText(array $variants): string
    {
        $n = count($variants);
        $labels = collect($variants)->map(fn (ProductVariant $v) => (string) $v->label);

        return match (true) {
            collect($variants)->every(fn (ProductVariant $v) => $v->power_btu !== null)
                && collect($variants)->pluck('power_btu')->unique()->count() === $n => "{$n} puissances",
            $labels->every(fn (string $l) => str_ends_with($l, ' L')) => "{$n} capacités",
            $labels->every(fn (string $l) => str_starts_with($l, 'Ø')) => "{$n} diamètres",
            default => "{$n} modèles",
        };
    }

    public static function imageFor(Product $product, ?ProductVariant $variant): ?ProductImage
    {
        $images = $product->images->whereNotNull('path');

        return ($variant ? $images->firstWhere('product_variant_id', $variant->id) : null) ?? $images->first();
    }
}
