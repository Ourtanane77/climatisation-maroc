<?php

namespace App\Http\Controllers\Api\Products;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpec;
use App\Models\ProductVariant;
use App\Settings\GeneralSettings;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Product page (design: Produit LG Dual Inverter): GET /products/{slug}.
 * Prices are centimes and follow the audience (pro price for a validated reseller).
 */
class ProductController extends Controller
{
    public function show(Request $request, string $slug, GeneralSettings $settings): JsonResponse
    {
        $product = Product::query()->published()->where('slug', $slug)
            ->with(['variants.specs', 'images', 'specs', 'brand', 'category.parent.parent', 'faqItems', 'seo',
                'accessories' => fn ($q) => $q->where('is_published', true)->with(['variants', 'images'])])
            ->firstOrFail();
        abort_if($product->variants->isEmpty(), 404);

        $reseller = Audience::isReseller();
        $images = $product->images->whereNotNull('path')->values();
        $default = $product->variants->firstWhere('is_default', true) ?? $product->variants->first();

        $sameRange = Present::cardQuery()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            // Same brand first (design: the LG page lists the other LG ranges first).
            ->orderByRaw('brand_id <=> ? desc', [$product->brand_id])
            ->orderBy('position')
            ->limit(4)
            ->get();

        return response()->json([
            'name' => $product->name,
            'slug' => $product->slug,
            'href' => $product->url(),
            'shortDescription' => $product->short_description,
            'description' => $product->description,
            'highlights' => collect($product->highlights ?? [])->filter(fn (array $h) => ($h['title'] ?? '') !== '')->values(),
            'art' => $product->art_key,
            'datasheet' => ImageUrl::path($product->datasheet_path),
            'brand' => $product->brand ? Present::brand($product->brand) : null,
            'category' => Present::category($product->category),
            'breadcrumb' => [...Present::categoryTrail($product->category), ['label' => $product->name]],
            'defaultSku' => $default->sku,
            'selectorLabel' => $this->selectorLabel($product),
            'variants' => $product->variants->map(fn (ProductVariant $v) => [
                'sku' => $v->sku,
                'label' => $v->label,
                'name' => $v->displayName(),
                'price' => $v->priceFor($reseller),
                'regularPrice' => ProductCardResource::discount($v, $reseller) > 0 ? $v->price : null,
                'stock' => $v->stock_status->value,
                'stockLabel' => $v->stock_status->getLabel(),
                'orderable' => $v->stock_status->isOrderable(),
                'dark' => $v->colour === 'Noir',
                // Index in `images` of this variant's photo (the gallery jumps to it), or null.
                'image' => ($index = $images->search(fn (ProductImage $i) => $i->product_variant_id === $v->id)) === false ? null : $index,
                'specs' => $v->specs->map(fn (ProductSpec $s) => ['label' => $s->label, 'value' => $s->value])->values(),
            ])->values(),
            'images' => $images->map(fn (ProductImage $i) => [
                'src' => ImageUrl::for($i, 1200),
                'thumb' => ImageUrl::for($i, 320),
                'alt' => $i->alt ?: $product->name,
            ])->values(),
            'specs' => $product->specs->map(fn (ProductSpec $s) => ['label' => $s->label, 'value' => $s->value])->values(),
            'accessories' => $product->accessories
                ->filter(fn (Product $a) => $a->variants->isNotEmpty())
                ->map(function (Product $a) use ($reseller) {
                    $v = $a->variants->firstWhere('is_default', true) ?? $a->variants->first();

                    return [
                        'name' => $a->name,
                        'sku' => $v->sku,
                        'href' => $a->url(),
                        'price' => $v->priceFor($reseller),
                        'image' => ImageUrl::for(ProductCardResource::imageFor($a, $v), 320),
                        'art' => $a->art_key,
                        'orderable' => $v->stock_status->isOrderable(),
                    ];
                })->values(),
            'technicalVisitPrice' => $settings->technical_visit_price,
            'sameRange' => ProductCardResource::collection($sameRange)->resolve($request),
            'faq' => $product->faqItems->map(fn ($f) => ['question' => $f->question, 'answer' => $f->answer])->values(),
            'seo' => Present::seo($product->seo),
            'isReseller' => $reseller,
        ]);
    }

    /** Heading of the variant selector, from what differs between variants. */
    private function selectorLabel(Product $product): string
    {
        $variants = $product->variants;
        $labels = $variants->pluck('label')->map(fn ($l) => (string) $l);

        return match (true) {
            $variants->every(fn (ProductVariant $v) => $v->power_btu !== null) => 'Puissance',
            $labels->every(fn (string $l) => str_ends_with($l, ' L')) => 'Capacité',
            $labels->every(fn (string $l) => str_starts_with($l, 'Ø')) => 'Diamètre',
            $variants->every(fn (ProductVariant $v) => $v->colour !== null) => 'Couleur',
            default => 'Modèle',
        };
    }
}
