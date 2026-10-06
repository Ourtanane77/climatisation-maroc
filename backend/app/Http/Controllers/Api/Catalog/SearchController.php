<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use App\Support\Catalog\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Product search (design/Recherche.dc.html): case- and accent-insensitive; every word of the
 * query must appear in the family name, keywords, a SKU, the brand or the sub-category name.
 */
class SearchController extends Controller
{
    private const PER_PAGE = 24;

    /** "Recherches fréquentes" of the no-result card (design). */
    private const POPULAR = ['Dual Inverter', 'Kit duo', 'Gaz R410', 'Support GT', "T\u{00E9}l\u{00E9}commande"];

    /** GET /search?q=&range=&tab=&page= */
    public function index(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));
        $results = $this->match($term, (string) $request->query('range', ''));

        $tab = (string) $request->query('tab', '');
        $tabs = $results->groupBy(fn (Product $p) => $p->category->path)
            ->map(fn (Collection $group) => [
                'value' => $group->first()->category->path,
                'label' => $group->first()->category->short_name ?? $group->first()->category->name,
                'count' => $group->count(),
                'position' => [$group->first()->category->parent_id ?? 0, $group->first()->category->position],
            ])
            ->sortBy('position')
            ->map(fn (array $t) => array_diff_key($t, ['position' => true]))
            ->values();
        if (! $tabs->contains('value', $tab)) {
            $tab = '';
        }
        $shown = $tab === '' ? $results : $results->filter(fn (Product $p) => $p->category->path === $tab)->values();

        $lastPage = max(1, (int) ceil($shown->count() / self::PER_PAGE));
        $page = max(1, min($lastPage, (int) $request->query('page', 1)));

        return response()->json([
            'term' => $term,
            'total' => $results->count(),
            'data' => ProductCardResource::collection($shown->forPage($page, self::PER_PAGE)->values())->resolve(),
            'tabs' => $tabs,
            'tab' => $tab,
            'popular' => self::POPULAR,
            'ranges' => Category::query()->active()->roots()->orderBy('position')->get()
                ->filter(fn (Category $c) => Product::query()->published()->whereIn('category_id', $c->descendantIds())->exists())
                ->map(fn (Category $c) => ['label' => $c->name, 'href' => $c->url()])
                ->values(),
            'meta' => ['total' => $shown->count(), 'page' => $page, 'perPage' => self::PER_PAGE, 'lastPage' => $lastPage],
        ]);
    }

    /** GET /search/suggest?q= : five families for the header and quick order. */
    public function suggest(Request $request): JsonResponse
    {
        $reseller = Audience::isReseller();
        $results = $this->match(trim((string) $request->query('q', '')), '')->take(5);

        return response()->json(['data' => $results->map(function (Product $p) use ($reseller) {
            $variant = $p->variants->firstWhere('is_default', true) ?? $p->variants->first();

            return [
                'name' => $p->name,
                'href' => $p->url(),
                'sku' => $p->variants->count() === 1 ? $variant?->sku : null,
                'price' => $p->variants->map(fn (ProductVariant $v) => $v->priceFor($reseller))->min(),
                'fromPrice' => $p->variants->count() > 1,
                'image' => ImageUrl::for(ProductCardResource::imageFor($p, $variant), 320),
                'art' => $p->art_key,
            ];
        })->values()]);
    }

    /** @return Collection<int, Product> */
    private function match(string $term, string $range): Collection
    {
        $words = array_values(array_filter(preg_split('/\s+/', self::normalize($term)) ?: []));
        if ($words === []) {
            return collect();
        }

        $root = $range !== '' ? Category::query()->roots()
            ->where(fn ($q) => $q->where('slug', $range)->orWhere('name', $range)->orWhere('short_name', $range))
            ->first() : null;

        return Listing::query($root?->descendantIds())->get()
            ->filter(function (Product $p) use ($words) {
                $haystack = self::normalize(implode(' ', [
                    $p->name,
                    $p->keywords,
                    $p->brand?->name,
                    $p->category->name,
                    $p->variants->pluck('sku')->implode(' '),
                    $p->variants->pluck('label')->implode(' '),
                ]));

                foreach ($words as $word) {
                    if (! str_contains($haystack, $word)) {
                        return false;
                    }
                }

                return true;
            })
            ->values();
    }

    private static function normalize(string $text): string
    {
        return mb_strtolower(Str::ascii($text));
    }
}
