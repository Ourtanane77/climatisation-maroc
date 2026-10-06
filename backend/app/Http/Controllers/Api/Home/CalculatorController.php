<?php

namespace App\Http\Controllers\Api\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use App\Support\Calculator\PowerCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Power calculator (design/Calculateur puissance.dc.html).
 * - GET /calculator/power?surface&ceiling&sun&top_floor&room: the estimate, its call to action and
 *   the matching air conditioners.
 * - GET /calculator/products: matching air conditioners for every tier at once, so the page can
 *   recompute in the browser without another request.
 */
class CalculatorController extends Controller
{
    private const PER_TIER = 3;

    public function power(Request $request): JsonResponse
    {
        $data = $request->validate([
            'surface' => ['required', 'numeric'],
            'ceiling' => ['nullable', 'in:'.implode(',', PowerCalculator::CEILINGS)],
            'sun' => ['nullable', 'in:'.implode(',', PowerCalculator::SUNS)],
            'top_floor' => ['nullable', 'boolean'],
            'room' => ['nullable', 'in:'.implode(',', PowerCalculator::ROOMS)],
        ]);

        $result = PowerCalculator::compute(
            (float) $data['surface'],
            $data['ceiling'] ?? 'standard',
            $data['sun'] ?? 'normale',
            (bool) ($data['top_floor'] ?? false),
            $data['room'] ?? 'salon',
        );

        return response()->json($result + [
            'cta' => self::cta($result['tierIndex']),
            'products' => $this->productsFor($result['tierIndex']),
        ]);
    }

    public function products(): JsonResponse
    {
        return response()->json([
            'tiers' => array_map(fn (int $i) => [
                'cta' => self::cta($i),
                'products' => $this->productsFor($i),
            ], array_keys(PowerCalculator::TIERS)),
        ]);
    }

    /** @return array{label: string, href: string} */
    public static function cta(int $tierIndex): array
    {
        [$btu, $label] = PowerCalculator::TIERS[$tierIndex];

        return $tierIndex < 4
            ? ['label' => "Voir les climatiseurs {$label}", 'href' => "/climatisation/mural?puissance={$btu}"]
            : ['label' => 'Voir les gainables', 'href' => '/climatisation/gainable'];
    }

    /**
     * Published air conditioners with a variant of the tier's power (30 000 BTU and more for the
     * last tier), murals first, as in the design's match list.
     *
     * @return list<array<string, mixed>>
     */
    private function productsFor(int $tierIndex): array
    {
        $btu = PowerCalculator::TIERS[$tierIndex][0];
        $climatisation = Category::query()->where('path', 'climatisation')->first();
        if (! $climatisation) {
            return [];
        }

        $categoryOrder = Category::query()->whereIn('id', $climatisation->descendantIds())->pluck('position', 'id');
        $variants = ProductVariant::query()
            ->whereHas('product', fn ($q) => $q->published()->whereIn('category_id', $categoryOrder->keys()))
            ->when($tierIndex < 4, fn ($q) => $q->where('power_btu', $btu), fn ($q) => $q->where('power_btu', '>=', $btu))
            ->with(['product.images', 'product.brand'])
            ->get()
            ->sortBy(fn (ProductVariant $v) => [$categoryOrder[$v->product->category_id] ?? 99, $v->product->position, $v->power_btu])
            ->unique('product_id')
            ->take(self::PER_TIER);

        return $this->items($variants);
    }

    /**
     * @param  Collection<int, ProductVariant>  $variants
     * @return list<array<string, mixed>>
     */
    private function items(Collection $variants): array
    {
        $reseller = Audience::isReseller();

        return $variants->map(fn (ProductVariant $v) => [
            'name' => $v->displayName(),
            'sku' => $v->sku,
            'href' => $v->product->url().($v->product->variants()->count() > 1 ? '?v='.rawurlencode($v->sku) : ''),
            'price' => $v->priceFor($reseller),
            'regularPrice' => ProductCardResource::discount($v, $reseller) > 0 ? $v->price : null,
            'image' => ImageUrl::for(ProductCardResource::imageFor($v->product, $v), 320),
            'art' => $v->product->art_key,
            'dark' => $v->colour === 'Noir',
        ])->values()->all();
    }
}
