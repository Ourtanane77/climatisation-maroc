<?php

namespace App\Support\Commerce;

use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Settings\GeneralSettings;
use App\Support\Api\ImageUrl;
use Illuminate\Support\Collection;

/**
 * Prices a basket on the server (prices are never taken from the client): public prices, or pro
 * prices for a validated reseller. Delivery is always free; the technical visit is an option
 * priced in Réglages.
 */
class CartPricer
{
    public const MAX_QTY = 999;

    public function __construct(private GeneralSettings $settings) {}

    /**
     * @param  array<int, array{sku?: mixed, qty?: mixed}>  $input
     * @return array{
     *     pricing: string,
     *     lines: list<array<string, mixed>>,
     *     invalid: list<array{sku: string, reason: string}>,
     *     count: int,
     *     subtotal: int,
     *     deliveryFee: int,
     *     technicalVisit: array{price: int, selected: bool},
     *     total: int,
     * }
     */
    public function quote(array $input, bool $reseller, bool $technicalVisit = false): array
    {
        $wanted = $this->normalizeLines($input);
        $variants = $this->variants(array_keys($wanted));

        $lines = [];
        $invalid = [];
        foreach ($wanted as $sku => $qty) {
            $variant = $variants->get($sku);
            if (! $variant) {
                $invalid[] = ['sku' => $sku, 'reason' => 'introuvable'];

                continue;
            }
            $lines[] = $this->line($variant, $qty, $reseller);
        }

        $orderable = array_filter($lines, fn (array $l) => $l['available']);
        $subtotal = array_sum(array_column($orderable, 'lineTotal'));
        $visitPrice = $this->settings->technical_visit_price;
        $visit = $technicalVisit && $orderable !== [];

        return [
            'pricing' => $reseller ? 'pro' : 'public',
            'lines' => $lines,
            'invalid' => $invalid,
            'count' => array_sum(array_column($orderable, 'qty')),
            'subtotal' => $subtotal,
            'deliveryFee' => 0,
            'technicalVisit' => ['price' => $visitPrice, 'selected' => $visit],
            'total' => $subtotal + ($visit ? $visitPrice : 0),
        ];
    }

    /**
     * "Pour l'installation": accessories of the basket's products, then the default references,
     * leaving out what is already in the basket.
     *
     * @param  list<string>  $skus
     * @return list<array<string, mixed>>
     */
    public function suggestions(array $skus, bool $reseller): array
    {
        $productIds = ProductVariant::query()->whereIn('sku', $skus)->pluck('product_id');
        $accessoryIds = Product::query()->whereIn('id', $productIds)->with('accessories:id')->get()
            ->flatMap(fn (Product $p) => $p->accessories->pluck('id'))->unique();

        $candidates = Product::query()->published()->whereIn('id', $accessoryIds)
            ->with(['variants', 'images'])->get()
            ->map(fn (Product $p) => $p->variants->first()?->setRelation('product', $p))
            ->filter();

        $count = (int) config('commerce.suggestion_count', 3);
        if ($candidates->whereNotIn('sku', $skus)->count() < $count) {
            $order = config('commerce.default_suggestions', []);
            $defaults = $this->variants($order)->sortBy(fn (ProductVariant $v) => array_search($v->sku, $order, true))->values();
            $candidates = $candidates->concat($defaults)->unique('sku');
        }

        return $candidates
            ->filter(fn (ProductVariant $v) => $v->stock_status->isOrderable() && ! in_array($v->sku, $skus, true))
            ->take($count)
            ->map(fn (ProductVariant $v) => [
                'sku' => $v->sku,
                'name' => $v->displayName(),
                'href' => $v->product->url(),
                'price' => $v->priceFor($reseller),
                'image' => ImageUrl::for(ProductCardResource::imageFor($v->product, $v), 320),
                'art' => $v->product->art_key,
                'dark' => $v->colour === 'Noir',
            ])->values()->all();
    }

    /**
     * Merges duplicates, clamps quantities, drops malformed rows.
     *
     * @param  array<int, mixed>  $input
     * @return array<string, int> sku => qty
     */
    public function normalizeLines(array $input): array
    {
        $lines = [];
        foreach ($input as $row) {
            $sku = is_array($row) ? trim((string) ($row['sku'] ?? '')) : '';
            $qty = is_array($row) ? (int) ($row['qty'] ?? 0) : 0;
            if ($sku === '' || $qty < 1) {
                continue;
            }
            $lines[$sku] = min(self::MAX_QTY, ($lines[$sku] ?? 0) + $qty);
        }

        return array_slice($lines, 0, 100, true);
    }

    /**
     * Published variants by SKU, with what a line needs.
     *
     * @param  list<string>  $skus
     * @return Collection<string, ProductVariant>
     */
    public function variants(array $skus): Collection
    {
        return ProductVariant::query()
            ->whereIn('sku', $skus)
            ->whereHas('product', fn ($q) => $q->where('is_published', true))
            ->with(['product.images', 'product.variants'])
            ->get()
            ->keyBy('sku');
    }

    /** @return array<string, mixed> */
    private function line(ProductVariant $variant, int $qty, bool $reseller): array
    {
        $product = $variant->product;
        $unit = $variant->priceFor($reseller);

        return [
            'variantId' => $variant->id,
            'sku' => $variant->sku,
            'name' => $variant->displayName(),
            'productName' => $product->name,
            'variantLabel' => $variant->label,
            'option' => self::optionText($variant),
            'href' => $product->url().($product->variants->count() > 1 ? '?v='.rawurlencode($variant->sku) : ''),
            'image' => ImageUrl::for(ProductCardResource::imageFor($product, $variant), 320),
            'art' => $product->art_key,
            'dark' => $variant->colour === 'Noir',
            'unitPrice' => $unit,
            'regularPrice' => $unit < $variant->price ? $variant->price : null,
            'qty' => $qty,
            'lineTotal' => $unit * $qty,
            'available' => $variant->stock_status->isOrderable(),
        ];
    }

    /** Line detail under the name, as in the design: "Puissance : 12 000 BTU". */
    public static function optionText(ProductVariant $variant): ?string
    {
        $parts = [];
        if ($variant->power_btu) {
            $parts[] = 'Puissance : '.number_format($variant->power_btu, 0, ',', "\u{00A0}")."\u{00A0}BTU";
        }
        if ($variant->colour) {
            $parts[] = 'Coloris : '.$variant->colour;
        }

        return $parts ? implode(' · ', $parts) : null;
    }
}
