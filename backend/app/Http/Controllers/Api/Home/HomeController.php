<?php

namespace App\Http\Controllers\Api\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SectorPage;
use App\Settings\GeneralSettings;
use App\Settings\HomeSettings;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * GET /home: everything the home page (design/Accueil.dc.html) shows below the header, driven by
 * the "Page d'accueil" settings and the live catalogue. Only published products and active
 * categories and brands are returned.
 */
class HomeController extends Controller
{
    public function __invoke(Request $request, HomeSettings $home, GeneralSettings $general): JsonResponse
    {
        // Only families with a real discount (regular price above the selling price): a product chosen
        // in « Page d'accueil » that is no longer on promotion is left out; no promotion, no block.
        $chosen = $this->families($home->promo_product_ids)->filter(fn (Product $p) => $p->isOnPromotion());
        // Completed with the catalogue's other discounted families (same rule as /promotions).
        $others = Product::query()->published()->whereNotIn('id', $chosen->pluck('id'))
            ->whereHas('variants', fn ($v) => $v->whereNotNull('promo_price')->whereColumn('promo_price', '<', 'price'))
            ->with(['variants', 'images', 'brand'])->orderBy('position')->limit(8)->get();
        $promotions = $chosen->concat($others)->take(8)
            ->map(fn (Product $p) => (new ProductCardResource($p))->toArray($request))
            ->values()->all();

        return response()->json([
            'hero' => [
                'title' => $home->hero_title,
                'subtitle' => $home->hero_subtitle,
                'image' => ImageUrl::path($home->hero_image),
                'cta' => $home->hero_cta_label && $home->hero_cta_url
                    ? ['label' => $home->hero_cta_label, 'href' => $home->hero_cta_url]
                    : null,
            ],
            'whatsapp' => $general->whatsapp_number,
            'bento' => $this->bento(),
            'newProducts' => array_map(
                fn (array $card) => ['badge' => ['text' => 'Nouveau', 'tone' => 'brand']] + $card,
                $this->cards($home->new_product_ids, $request),
            ),
            'promotions' => [
                // Brand filter chips, in brand order (design: Toutes, LG, Carrier, CIAT, Fitco).
                'brands' => Brand::query()->whereIn('name', array_filter(array_column($promotions, 'brand')))
                    ->orderBy('position')->pluck('name')->all(),
                'products' => $promotions,
            ],
            'ducts' => $this->ducts($home->ducts_product_ids),
            'supplies' => $this->cards($home->supplies_product_ids, $request),
            'brands' => $this->brands($home->brand_ids),
            'pro' => ['phone' => $this->phone($general, 'Projets et revendeurs')],
        ]);
    }

    /**
     * Published families in the configured order, as product cards.
     *
     * @param  list<int>  $ids
     * @return list<array<string, mixed>>
     */
    private function cards(array $ids, Request $request): array
    {
        return $this->families($ids)
            ->map(fn (Product $p) => (new ProductCardResource($p))->toArray($request))
            ->values()->all();
    }

    /**
     * @param  list<int>  $ids
     * @return Collection<int, Product>
     */
    private function families(array $ids): Collection
    {
        if (! $ids) {
            return collect();
        }

        $products = Product::query()->published()->whereIn('id', $ids)
            ->whereHas('variants')
            ->with(['variants', 'images', 'brand'])
            ->get()->keyBy('id');

        return collect($ids)->map(fn (int $id) => $products->get($id))->filter()->values();
    }

    /**
     * "Gaines circulaires" rail: the live Gaines range (rigid circular ducts, flexibles souples,
     * flexibles isolés, in category order then by diameter), one card per reference as drawn.
     * Families picked in "Page d'accueil" come first; everything else follows automatically, so a
     * duct added or published in the back office appears without editing the settings.
     *
     * @param  list<int>  $featuredIds
     * @return list<array<string, mixed>>
     */
    private function ducts(array $featuredIds): array
    {
        $reseller = Audience::isReseller();
        $range = Category::query()->active()->where('path', 'gaines')->first();
        if (! $range) {
            return [];
        }
        $categories = Category::query()->active()->whereIn('id', $range->descendantIds())->get()->keyBy('id');
        $rank = function (Product $p) use ($featuredIds, $categories): array {
            $featured = array_search($p->id, $featuredIds, true);
            $category = $categories->get($p->category_id);
            $diameter = preg_match('/Q(\d{2,3})/u', $p->name, $match) === 1 ? (int) $match[1] : 0;

            return [
                $featured === false ? 1000 : (int) $featured,
                ($category === null || $category->parent_id === null) ? 1000 : (int) $category->position,
                $diameter,
                (int) $p->position,
            ];
        };

        $products = Product::query()->published()->whereIn('category_id', $categories->keys())
            ->whereHas('variants')->with(['variants', 'images'])->get()
            ->sort(fn (Product $a, Product $b) => $rank($a) <=> $rank($b))->values();

        return $products->flatMap(fn (Product $p) => $p->variants->map(function (ProductVariant $v) use ($p, $reseller) {
            preg_match('/(?:\x{00D8}\s?|Q)(\d{2,3})\b/u', (string) ($v->label ?: $p->name), $m);
            $diameter = isset($m[1]) ? (int) $m[1] : null;
            $price = $v->priceFor($reseller);

            return [
                'name' => $v->setRelation('product', $p)->displayName(),
                'sku' => $v->sku,
                'href' => $p->url().($p->variants->count() > 1 ? '?v='.rawurlencode($v->sku) : ''),
                'diameter' => $diameter,
                'kind' => match (true) {
                    (bool) preg_match('/circulaire/iu', $p->name) => 'rigide',
                    (bool) preg_match('/calorifug|isol/iu', $p->name) => 'calo',
                    (bool) preg_match('/alu/iu', $p->name) => 'alu',
                    default => 'souple',
                },
                'image' => ImageUrl::for(ProductCardResource::imageFor($p, $v)),
                'price' => $price,
                'onRequest' => $v->isOnRequest(),
            ];
        }))->values()->take(16)->all();
    }

    /**
     * Catalogue bento: the six ranges, then "Solutions professionnelles" (design order and copy).
     *
     * @return list<array<string, mixed>>
     */
    private function bento(): array
    {
        $ranges = Category::query()->public()->roots()
            ->where('slug', '!=', 'froid')
            ->with(['children' => fn ($q) => $q->whereIn('id', Category::query()->public()->select('id'))->orderBy('position')])
            ->orderBy('position')->limit(6)->get();

        $tiles = $ranges->values()->map(function (Category $c, int $i) {
            // The first two tiles list their sub-ranges as chips (Climatisation: all four,
            // Chauffe-eau: three); the others show their short line.
            $types = $i < 2
                ? $c->children->take($i === 0 ? 4 : 3)->map(fn (Category $child) => [
                    'label' => $child->short_name ?: $child->name,
                    'href' => $child->url(),
                ])->values()->all()
                : null;

            return [
                'key' => $c->slug,
                'title' => $c->short_name ?: $c->name,
                'href' => $c->url(),
                'icon' => $c->icon,
                'bg' => $c->tile_bg,
                'text' => $types ? null : $c->tile_text,
                'types' => $types,
                'art' => $c->art_key,
                'image' => ImageUrl::path($c->image),
            ];
        })->all();

        // Sector names as drawn ("Hôtels, Restaurants, Bureaux, Écoles, …"): a published sector
        // links to its page, the others to the solutions hub.
        $sectors = SectorPage::query()->orderBy('position')->get(['name', 'slug', 'is_published'])
            ->filter(fn (SectorPage $s) => in_array($s->slug, ['hotels-riads', 'restaurants', 'bureaux', 'ecoles'], true))
            ->map(fn (SectorPage $s) => [
                'label' => trim((string) preg_split('/\s+(et|&)\s+/u', $s->name)[0]),
                'href' => $s->is_published ? $s->url() : '/solutions',
            ])->values()->all();

        $tiles[] = [
            'key' => 'solutions',
            'title' => 'Solutions professionnelles',
            'href' => '/solutions',
            'icon' => 'snow',
            'bg' => '#E8EFF8',
            'text' => null,
            'types' => [...$sectors, ['label' => '…', 'href' => '/solutions']],
            'art' => null,
            'image' => null,
        ];

        return $tiles;
    }

    /**
     * @param  list<int>  $ids
     * @return list<array{name: string, href: string, logo: string|null, aspect: float|null}>
     */
    private function brands(array $ids): array
    {
        $brands = Brand::query()->active()->whereIn('id', $ids)->get()->keyBy('id');

        return collect($ids)->map(fn (int $id) => $brands->get($id))->filter()
            ->map(fn (Brand $b) => [
                'name' => $b->name,
                'href' => $b->url(),
                'logo' => ImageUrl::logo($b->logo),
                'aspect' => $b->logo_aspect !== null ? (float) $b->logo_aspect : null,
            ])->values()->all();
    }

    /** @return array{label: string, display: string, href: string}|null */
    private function phone(GeneralSettings $general, string $label): ?array
    {
        foreach ($general->phones as $phone) {
            if ($phone['label'] === $label) {
                return [
                    'label' => $label,
                    'display' => $phone['display'],
                    'href' => 'tel:+212'.ltrim((string) preg_replace('/\D/', '', $phone['display']), '0'),
                ];
            }
        }

        return null;
    }
}
