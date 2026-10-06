<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Catalog\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /promotions?brand=&range=&page= : families with at least one discounted variant
 * (design/Promotions.dc.html). Each card only carries its discounted variants, six per page.
 */
class PromotionController extends Controller
{
    private const PER_PAGE = 6;

    public function __invoke(Request $request): JsonResponse
    {
        $families = Listing::query()->get()
            ->map(function (Product $p) {
                $promo = $p->variants->filter(fn (ProductVariant $v) => $v->isDiscounted())->values();

                return $promo->isEmpty() ? null : $p->setRelation('variants', $promo);
            })
            ->filter()
            ->values();

        $brand = (string) $request->query('brand', '');
        $range = (string) $request->query('range', '');
        $matching = $families
            ->filter(fn (Product $p) => $brand === '' || $p->brand?->slug === $brand)
            ->filter(fn (Product $p) => $range === '' || $p->category->path === $range)
            ->values();

        $lastPage = max(1, (int) ceil($matching->count() / self::PER_PAGE));
        $page = max(1, min($lastPage, (int) $request->query('page', 1)));

        return response()->json([
            'data' => ProductCardResource::collection($matching->forPage($page, self::PER_PAGE)->values())->resolve(),
            'filters' => [
                'brands' => $families->pluck('brand')->filter()->unique('id')->sortBy('position')
                    ->map(fn ($b) => ['value' => $b->slug, 'label' => $b->name, 'selected' => $b->slug === $brand])->values(),
                'ranges' => $families->pluck('category')->unique('id')->sortBy(fn ($c) => [$c->parent_id, $c->position])
                    ->map(fn ($c) => ['value' => $c->path, 'label' => $c->short_name ?? $c->name, 'selected' => $c->path === $range])->values(),
            ],
            'meta' => [
                'all' => $families->count(),
                'total' => $matching->count(),
                'page' => $page,
                'perPage' => self::PER_PAGE,
                'lastPage' => $lastPage,
            ],
        ]);
    }
}
