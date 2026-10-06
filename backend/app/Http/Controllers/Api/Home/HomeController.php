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
        $promotions = $this->cards($home->promo_product_ids, $request);

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
     * Ducts rail: one card per reference (design shows each diameter separately), with the
     * diameter tag and the drawn duct (souple / calorifugé / aluminium).
     *
     * @param  list<int>  $ids
     * @return list<array<string, mixed>>
     */
    private function ducts(array $ids): array
    {
        $reseller = Audience::isReseller();

        return $this->families($ids)->flatMap(fn (Product $p) => $p->variants->map(function (ProductVariant $v) use ($p, $reseller) {
            preg_match('/(\d{2,3})/', (string) ($v->label ?? $p->name), $m);
            $diameter = $m[1] ?? null;

            return [
                'name' => $v->setRelation('product', $p)->displayName(),
                'sku' => $v->sku,
                'href' => $p->url().($p->variants->count() > 1 ? '?v='.rawurlencode($v->sku) : ''),
                'diameter' => $diameter ? (int) $diameter : null,
                'kind' => match (true) {
                    (bool) preg_match('/calorifug/iu', $p->name) => 'calo',
                    (bool) preg_match('/alu/iu', $p->name) => 'alu',
                    default => 'souple',
                },
                'price' => $v->priceFor($reseller),
            ];
        }))->values()->all();
    }

    /**
     * Catalogue bento: the six ranges, then "Solutions professionnelles" (design order and copy).
     *
     * @return list<array<string, mixed>>
     */
    private function bento(): array
    {
        $ranges = Category::query()->active()->roots()
            ->where('slug', '!=', 'froid')
            ->with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('position')])
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
                'art' => $c->art_key ?? 'mural',
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
                'logo' => ImageUrl::path($b->logo),
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
