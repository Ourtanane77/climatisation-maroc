<?php

namespace App\Http\Controllers\Api\Products;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\ProductSpec;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Comparison table (design: Comparer): GET /products/compare?skus=A,B,C (max 3, in the given order).
 * Rows are the design's fixed keys; values come from the variant, then the family, then spec rows.
 */
class CompareController extends Controller
{
    public const MAX = 3;

    private const EMPTY = '—';

    public function __invoke(Request $request): JsonResponse
    {
        $skus = collect(explode(',', (string) $request->query('skus')))
            ->map(fn ($s) => trim($s))->filter()->unique()->take(self::MAX)->values();

        $variants = ProductVariant::query()->whereIn('sku', $skus)
            ->whereHas('product', fn ($q) => $q->published())
            ->with(['specs', 'product.brand', 'product.category', 'product.specs', 'product.images'])
            ->get()
            ->sortBy(fn (ProductVariant $v) => $skus->search($v->sku))
            ->values();

        $reseller = Audience::isReseller();
        $products = $variants->map(fn (ProductVariant $v) => [
            'sku' => $v->sku,
            'name' => $v->displayName(),
            'href' => $v->product->url().'?v='.rawurlencode($v->sku),
            'price' => $v->priceFor($reseller),
            'regularPrice' => ProductCardResource::discount($v, $reseller) > 0 ? $v->price : null,
            'image' => ImageUrl::for(ProductCardResource::imageFor($v->product, $v), 640),
            'art' => $v->product->art_key,
            'dark' => $v->colour === 'Noir',
            'orderable' => $v->stock_status->isOrderable(),
            'category' => Present::category($v->product->category),
        ]);

        $rows = collect([
            'Marque' => fn (ProductVariant $v) => $v->product->brand?->name,
            'Puissance' => fn (ProductVariant $v) => $v->power_btu ? number_format($v->power_btu, 0, ',', "\u{00A0}")."\u{00A0}BTU" : null,
            'Surface conseillée' => fn (ProductVariant $v) => $this->spec($v, '/^surface/i'),
            'Technologie' => fn (ProductVariant $v) => $v->product->technology ?? $this->spec($v, '/^technologie/i'),
            'Fluide' => fn (ProductVariant $v) => $v->product->refrigerant ?? $this->spec($v, '/fluide|r[ée]frig[ée]rant|gaz/i'),
            'Couleur' => fn (ProductVariant $v) => $v->colour ?? $this->spec($v, '/^couleur/i'),
            'Wi-Fi' => fn (ProductVariant $v) => $v->product->wifi ?? $this->spec($v, '/wi-?fi|connectivit/i'),
        ])->map(function (callable $get, string $label) use ($variants) {
            $values = $variants->map(fn (ProductVariant $v) => ($value = $get($v)) ? Str::ucfirst((string) $value) : self::EMPTY)->values();

            return ['label' => $label, 'values' => $values, 'differs' => $values->unique()->count() > 1];
        })->values();

        return response()->json(['products' => $products, 'rows' => $rows, 'max' => self::MAX]);
    }

    /** First spec value whose label matches: the variant's own rows, then the family's. */
    private function spec(ProductVariant $variant, string $pattern): ?string
    {
        $match = fn (ProductSpec $s) => (bool) preg_match($pattern, $s->label);

        return $variant->specs->first($match)->value ?? $variant->product->specs->first($match)->value ?? null;
    }
}
