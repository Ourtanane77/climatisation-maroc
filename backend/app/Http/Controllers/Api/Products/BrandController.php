<?php

namespace App\Http\Controllers\Api\Products;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Settings\GeneralSettings;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Brand hub (GET /brands) and brand page (GET /brands/{slug}, design: Marque LG): the brand's
 * products grouped by category, its technologies, and other brands.
 */
class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::query()->active()->orderBy('position')->orderBy('name')
            ->withCount(['products' => fn ($q) => $q->published()])
            ->get();

        return response()->json(['data' => $brands->map(fn (Brand $b) => [...Present::brand($b), 'productCount' => $b->products_count])->values()]);
    }

    public function show(Request $request, string $slug, GeneralSettings $settings): JsonResponse
    {
        $brand = Brand::query()->active()->where('slug', $slug)->with('seo')->firstOrFail();

        $products = Present::cardQuery()->where('brand_id', $brand->id)
            ->with('category.parent')
            ->orderBy('position')
            ->get();

        $groups = $products->groupBy('category_id')
            ->map(function ($items) use ($request) {
                /** @var Category $category */
                $category = $items->first()->category;

                return [
                    'key' => $category->slug,
                    'label' => $category->short_name ?: $category->name,
                    'title' => $category->name,
                    'href' => $category->url(),
                    'position' => [$category->parent->position ?? $category->position, $category->parent ? $category->position : -1],
                    'count' => $items->count(),
                    'products' => ProductCardResource::collection($items)->resolve($request),
                ];
            })
            ->sortBy([fn (array $a, array $b) => $a['position'] <=> $b['position']])
            ->map(fn (array $g) => array_diff_key($g, ['position' => true]))
            ->values();

        $others = Brand::query()->active()->whereKeyNot($brand->id)
            ->whereHas('products', fn ($q) => $q->published())
            ->orderBy('position')->orderBy('name')
            ->limit(4)
            ->get();

        $advice = collect($settings->phones)->firstWhere('label', 'Conseil') ?? collect($settings->phones)->first();

        return response()->json([
            'brand' => [
                ...Present::brand($brand),
                'intro' => $brand->intro,
                'features' => $brand->features ?? [],
            ],
            'heroImage' => $this->heroImage($products->all()),
            'groups' => $groups,
            'others' => $others->map(fn (Brand $b) => Present::brand($b))->values(),
            'advicePhone' => $advice ? ['display' => $advice['display'], 'href' => self::tel($advice['display'])] : null,
            'whatsapp' => $settings->whatsapp_number,
            'seo' => Present::seo($brand->seo),
        ]);
    }

    /** "0666-088348" → "tel:+212666088348". */
    private static function tel(string $display): string
    {
        $digits = (string) preg_replace('/\D/', '', $display);

        return 'tel:+212'.ltrim($digits, '0');
    }

    /**
     * The brand's first product photo, for the hero art box.
     *
     * @param  list<Product>  $products
     */
    private function heroImage(array $products): ?string
    {
        foreach ($products as $product) {
            $image = ProductCardResource::imageFor($product, null);
            if ($image) {
                return ImageUrl::for($image, 1200);
            }
        }

        return null;
    }
}
