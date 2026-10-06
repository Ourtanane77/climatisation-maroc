<?php

namespace App\Http\Controllers\Api\Pro;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\OrderLine;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\Api\ImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Commande rapide par référence (validated resellers): reference autocomplete, list resolution
 * (typed rows or a pasted list) and the reseller's frequent references. Each item carries the
 * public price and the reseller's own price (pro price where set).
 */
class QuickOrderController extends Controller
{
    public const MAX_LINES = 200;

    /** Autocomplete: up to 5 references starting with, or products whose name contains, `q`. */
    public function references(Request $request): JsonResponse
    {
        $q = mb_strtoupper(trim((string) $request->query('q', '')));
        if ($q === '') {
            return response()->json(['data' => []]);
        }

        $variants = self::orderable()
            ->where(fn (Builder $w) => $w->where('sku', 'like', self::like($q).'%')
                ->orWhereHas('product', fn (Builder $p) => $p->where('name', 'like', '%'.self::like($q).'%')))
            ->orderByRaw('CASE WHEN sku LIKE ? THEN 0 ELSE 1 END', [self::like($q).'%'])
            ->orderBy('sku')
            ->limit(5)
            ->get();

        return response()->json(['data' => $variants->map(fn (ProductVariant $v) => self::item($v))->values()]);
    }

    /**
     * Resolves `lines: [{ref, qty}]` or a pasted list (`paste`: one "REF QTY" per line). Rows keep their
     * order; a reference repeated in a paste has its quantities summed. Unknown references come back
     * with `item: null`.
     */
    public function resolve(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lines' => ['array', 'max:'.self::MAX_LINES],
            'lines.*.ref' => ['required', 'string', 'max:64'],
            'lines.*.qty' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'paste' => ['nullable', 'string', 'max:20000'],
        ]);

        $rows = isset($data['paste']) ? self::parsePaste($data['paste']) : array_map(
            fn (array $l) => ['ref' => self::norm($l['ref']), 'qty' => (int) ($l['qty'] ?? 1)],
            $data['lines'] ?? [],
        );

        $variants = self::orderable()
            ->whereIn('sku', array_unique(array_column($rows, 'ref')))
            ->get()
            ->keyBy(fn (ProductVariant $v) => mb_strtoupper($v->sku));

        return response()->json(['lines' => array_map(fn (array $row) => [
            'ref' => $row['ref'],
            'qty' => $row['qty'],
            'item' => isset($variants[$row['ref']]) ? self::item($variants[$row['ref']]) : null,
        ], $rows)]);
    }

    /** The reseller's most ordered references; completed with the shop's best sellers. */
    public function frequent(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $limit = 5;

        $mine = OrderLine::query()
            ->whereHas('order', fn (Builder $o) => $o->where('user_id', $user->id))
            ->selectRaw('sku, SUM(qty) as total')->groupBy('sku')->orderByDesc('total')
            ->limit($limit)->pluck('sku')->all();
        $skus = $mine;
        if (count($skus) < $limit) {
            $skus = array_values(array_unique([...$skus, ...OrderLine::query()
                ->selectRaw('sku, SUM(qty) as total')->groupBy('sku')->orderByDesc('total')
                ->limit($limit * 2)->pluck('sku')->all()]));
        }

        $variants = self::orderable()->whereIn('sku', $skus)->get()->keyBy('sku');
        $items = collect($skus)->filter(fn (string $sku) => isset($variants[$sku]))->take($limit)
            ->map(fn (string $sku) => self::item($variants[$sku]))->values();

        return response()->json(['data' => $items]);
    }

    /** @return list<array{ref: string, qty: int}> */
    public static function parsePaste(string $paste): array
    {
        $rows = [];
        foreach (preg_split('/\R+/u', $paste) ?: [] as $line) {
            if (! preg_match('/^([^\s;,]+)[\s;,x×]*(\d+)?/iu', trim($line), $m)) {
                continue;
            }
            $ref = self::norm($m[1]);
            $qty = isset($m[2]) ? max(1, (int) $m[2]) : 1;
            $rows[$ref] = ['ref' => $ref, 'qty' => ($rows[$ref]['qty'] ?? 0) + $qty];
            if (count($rows) >= self::MAX_LINES) {
                break;
            }
        }

        return array_values($rows);
    }

    /** @return array<string, mixed> */
    public static function item(ProductVariant $variant): array
    {
        $product = $variant->product;

        return [
            'sku' => $variant->sku,
            'name' => $variant->displayName(),
            'href' => $product->url().($product->variants_count > 1 ? '?v='.rawurlencode($variant->sku) : ''),
            'price' => $variant->sellingPrice(),
            'proPrice' => $variant->priceFor(true),
            'art' => $product->art_key,
            'image' => ImageUrl::for(ProductCardResource::imageFor($product, $variant), 320),
            'inStock' => $variant->stock_status->isOrderable(),
        ];
    }

    /** @return Builder<ProductVariant> */
    private static function orderable(): Builder
    {
        return ProductVariant::query()
            ->whereHas('product', fn (Builder $p) => $p->where('is_published', true))
            ->with(['product' => fn ($p) => $p->withCount('variants')->with('images')]);
    }

    private static function norm(string $ref): string
    {
        return mb_strtoupper(trim($ref));
    }

    private static function like(string $value): string
    {
        return addcslashes($value, '%_\\');
    }
}
