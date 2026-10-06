<?php

namespace App\Http\Controllers\Api\Pro;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\FaqItem;
use App\Models\Page;
use App\Models\ProductVariant;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;

/**
 * Data of the public Espace professionnel page: brand logos ("Nos marques"), the FAQ edited on the
 * `espace-professionnel` page, and the quick-order preview rows priced from the catalogue.
 */
class ProLandingController extends Controller
{
    /** Preview rows drawn in design/Espace professionnel.dc.html: [reference, quantity]. */
    private const PREVIEW = [['CUIV0005', 4], ['CUIV0018', 2], ['GAZ00042', 1], ['CLIM00076', 10]];

    public function __invoke(): JsonResponse
    {
        $brands = Brand::query()->active()->whereNotNull('logo')->orderBy('position')->get()
            ->map(fn (Brand $b) => [
                'name' => $b->name,
                'href' => $b->url(),
                'logo' => ImageUrl::path($b->logo),
                'aspect' => (float) ($b->logo_aspect ?: 2),
            ])->values();

        $page = Page::query()->where('slug', 'espace-professionnel')->first();
        $faq = $page ? $page->faqItems()->get()->map(fn (FaqItem $f) => [
            'question' => $f->question,
            'answer' => $f->answer,
        ])->values() : collect();

        $variants = ProductVariant::query()->with('product')
            ->whereIn('sku', array_column(self::PREVIEW, 0))->get()->keyBy('sku');
        $preview = collect(self::PREVIEW)
            ->filter(fn (array $row) => isset($variants[$row[0]]))
            ->map(function (array $row) use ($variants) {
                $variant = $variants[$row[0]];

                return [
                    'ref' => $variant->sku,
                    'name' => $variant->displayName(),
                    'qty' => $row[1],
                    'total' => $variant->sellingPrice() * $row[1],
                ];
            })->values();

        return response()->json(['brands' => $brands, 'faq' => $faq, 'preview' => $preview]);
    }
}
