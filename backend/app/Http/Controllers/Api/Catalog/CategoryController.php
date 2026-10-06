<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Enums\CategoryTemplate;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\FaqItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use App\Support\Catalog\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Category pages: range landing (Gamme), listing (Catégorie) and dense list (Liste rapide).
 * GET /categories/{path} and GET /categories/{path}/products.
 */
class CategoryController extends Controller
{
    public function show(string $path): JsonResponse
    {
        $category = $this->find($path);
        $ids = $category->descendantIds();
        $families = Listing::query($ids)->get();
        $parent = $category->parent;
        $root = $parent ?? $category;

        return response()->json([
            'name' => $category->name,
            'h1' => $category->seo->h1 ?? $category->seo->title ?? $category->name,
            'shortName' => $category->short_name,
            'path' => $category->path,
            'href' => $category->url(),
            'template' => $category->template->value,
            'isQuoteOnly' => (bool) $category->is_quote_only,
            'intro' => $category->intro,
            'body' => $category->body,
            'breadcrumb' => $this->breadcrumb($category),
            'parent' => $parent ? ['label' => $parent->name, 'href' => $parent->url()] : null,
            'children' => $category->children()->active()->get()
                ->map(fn (Category $c) => $this->tile($c))->values(),
            // Sister type chips: the parent's children (or this range's children on a range page).
            'siblings' => $root->children()->active()->get()->map(fn (Category $c) => [
                'label' => $c->short_name ?? $c->name,
                'href' => $c->url(),
                'active' => $c->id === $category->id,
            ])->values(),
            'powers' => $this->powers($category, $families),
            'popular' => ProductCardResource::collection($this->popular($families))->resolve(),
            'brands' => $this->brands($families),
            'guides' => $category->articles()->published()->get()->map(fn (Article $a) => [
                'title' => $a->title,
                'href' => $a->url(),
            ])->values(),
            'faq' => $category->faqItems()->get()->map(fn (FaqItem $f) => [
                'question' => $f->question,
                'answer' => $f->answer,
            ])->values(),
            'seo' => [
                'title' => $category->seo?->title,
                'description' => $category->seo?->description,
                'noindex' => (bool) $category->seo?->noindex,
            ],
            'productCount' => $families->count(),
        ]);
    }

    /**
     * Listing with filters, facets, sort and pagination; `?flat=1` returns every variant as a
     * dense row (Liste rapide), filtered on the client as in the design.
     */
    public function products(Request $request, string $path): JsonResponse
    {
        $category = $this->find($path);
        $all = Listing::query($category->descendantIds())->get();

        if ($request->boolean('flat')) {
            return response()->json(['data' => $this->rows($all)]);
        }

        $filters = Listing::filtersFrom($request->query());
        $sort = in_array($request->query('sort'), Listing::SORTS, true) ? (string) $request->query('sort') : 'price_asc';
        $matching = Listing::sort(Listing::filter($all, $filters), $sort);
        $perPage = max(1, min(48, (int) $request->query('per_page', 12)));
        $lastPage = max(1, (int) ceil($matching->count() / $perPage));
        $page = max(1, min($lastPage, (int) $request->query('page', 1)));

        return response()->json([
            'data' => ProductCardResource::collection($matching->forPage($page, $perPage)->values())->resolve(),
            'facets' => Listing::facets($all, $filters),
            'meta' => [
                'total' => $matching->count(),
                'page' => $page,
                'perPage' => $perPage,
                'lastPage' => $lastPage,
                'sort' => $sort,
            ],
        ]);
    }

    private function find(string $path): Category
    {
        return Category::query()->active()->where('path', trim($path, '/'))->firstOrFail();
    }

    /** @return list<array{label: string, href?: string}> */
    private function breadcrumb(Category $category): array
    {
        $chain = [];
        for ($c = $category; $c; $c = $c->parent) {
            array_unshift($chain, $c);
        }
        $items = [['label' => 'Accueil', 'href' => '/']];
        foreach ($chain as $i => $c) {
            $items[] = $i === count($chain) - 1 ? ['label' => $c->name] : ['label' => $c->name, 'href' => $c->url()];
        }

        return $items;
    }

    /** @return array<string, mixed> */
    private function tile(Category $c): array
    {
        return [
            'name' => $c->name,
            'shortName' => $c->short_name,
            'href' => $c->url(),
            'text' => $c->tile_text,
            'bg' => $c->tile_bg,
            'art' => $c->art_key,
            'image' => ImageUrl::path($c->image),
            'productCount' => Product::query()->published()->whereIn('category_id', $c->descendantIds())->count(),
        ];
    }

    /**
     * "Climatiseurs par puissance" chips (design: 9 000 … 24 000 BTU "Jusqu'à N m²", then
     * "30 000 BTU et plus"). Surface = BTU / 600, the design's rule. Each chip links to the
     * sub-category holding most products of that power, filtered on it.
     *
     * @param  Collection<int, Product>  $families
     * @return list<array{label: string, sub: string, href: string}>
     */
    private function powers(Category $category, Collection $families): array
    {
        if ($category->template !== CategoryTemplate::Landing) {
            return [];
        }
        $variants = $families->flatMap(fn (Product $p) => $p->variants->map(fn (ProductVariant $v) => [$v->power_btu, $p->category_id]))
            ->filter(fn ($pair) => $pair[0] !== null);
        if ($variants->isEmpty()) {
            return [];
        }
        $paths = Category::query()->pluck('path', 'id');
        $hrefFor = function (Collection $pairs, ?int $btu) use ($paths): string {
            $categoryId = $pairs->countBy(fn ($pair) => $pair[1])->sortDesc()->keys()->first();

            return '/'.$paths[$categoryId].($btu ? '?puissance='.$btu : '');
        };

        $chips = [];
        foreach ($variants->groupBy(fn ($pair) => $pair[0])->sortKeys() as $btu => $pairs) {
            if ($btu < 30000) {
                $chips[] = [
                    'label' => Listing::powerLabel((int) $btu),
                    'sub' => "Jusqu\u{2019}\u{00E0} ".intdiv((int) $btu, 600)."\u{00A0}m\u{00B2}",
                    'href' => $hrefFor($pairs, (int) $btu),
                ];
            }
        }
        $big = $variants->filter(fn ($pair) => $pair[0] >= 30000);
        if ($big->isNotEmpty()) {
            $chips[] = [
                'label' => "30\u{00A0}000 BTU et plus",
                'sub' => "Au-del\u{00E0} de 40\u{00A0}m\u{00B2}",
                'href' => $hrefFor($big, null),
            ];
        }

        return $chips;
    }

    /**
     * "Les plus demandés": featured families first, then catalogue order; four cards.
     *
     * @param  Collection<int, Product>  $families
     * @return Collection<int, Product>
     */
    private function popular(Collection $families): Collection
    {
        return $families->sortBy(fn (Product $p) => [$p->is_featured ? 0 : 1, $p->position])->take(4)->values();
    }

    /**
     * @param  Collection<int, Product>  $families
     * @return list<array<string, mixed>>
     */
    private function brands(Collection $families): array
    {
        return $families->pluck('brand')->filter()->unique('id')
            ->filter(fn (Brand $b) => $b->is_active)
            ->sortBy('position')
            ->map(fn (Brand $b) => [
                'name' => $b->name,
                'slug' => $b->slug,
                'href' => $b->url(),
                'logo' => ImageUrl::path($b->logo),
                'logoAspect' => $b->logo_aspect !== null ? (float) $b->logo_aspect : null,
                'note' => $b->is_official_distributor ? 'Distributeur officiel' : null,
            ])->values()->all();
    }

    /**
     * Every variant as a dense row, with its sub-category for the pills.
     *
     * @param  Collection<int, Product>  $families
     * @return list<array<string, mixed>>
     */
    private function rows(Collection $families): array
    {
        $reseller = Audience::isReseller();

        return $families->flatMap(fn (Product $p) => $p->variants->map(fn (ProductVariant $v) => [
            'name' => $v->displayName(),
            'sku' => $v->sku,
            'price' => $v->priceFor($reseller),
            'href' => $p->url().($p->variants->count() > 1 ? '?v='.rawurlencode($v->sku) : ''),
            'image' => ImageUrl::for(ProductCardResource::imageFor($p, $v), 320),
            'art' => $p->art_key,
            'inStock' => $v->stock_status->isOrderable(),
            'sub' => $p->category->short_name ?? $p->category->name,
            'subPath' => $p->category->path,
        ]))->values()->all();
    }
}
