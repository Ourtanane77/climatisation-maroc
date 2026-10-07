<?php

namespace App\Http\Controllers\Api\Seo;

use App\Enums\PageKind;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\Page;
use App\Models\Product;
use App\Models\SectorPage;
use App\Models\ServicePage;
use App\Support\Api\ImageUrl;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Every public URL for sitemap.xml (frontend/src/app/sitemap.ts), with its last change. Only
 * active categories and brands, published products and content: an unpublished record never
 * appears. Fixed pages (contact, devis…) use the latest content change as their date.
 */
class SitemapController extends Controller
{
    public function __invoke(): JsonResponse
    {
        /** @var Collection<int, array{path: string, lastmod: string|null, images: list<string>}> $urls */
        $urls = collect();
        /** @param list<string> $images */
        $add = function (string $path, ?CarbonInterface $lastmod, array $images = []) use ($urls): void {
            $urls->push(['path' => $path, 'lastmod' => $lastmod?->toIso8601String(), 'images' => $images]);
        };

        $activeCategoryIds = Category::query()->active()->pluck('id');
        $products = Product::query()->published()->whereIn('category_id', $activeCategoryIds)
            ->whereHas('variants')->with('images')->orderBy('position')->get();
        $categories = Category::query()->active()->orderBy('path')->get();
        // A sub-category under an inactive range is not reachable.
        $categories = $categories->filter(fn (Category $c) => $c->parent_id === null || $categories->contains('id', $c->parent_id));
        // Empty categories (no published product in them or below) are thin pages: left out, except
        // quote-only ranges (Froid), whose page is a quote request.
        $withProducts = $products->pluck('category_id')->unique()->flip();
        $categories = $categories->filter(fn (Category $c) => $c->is_quote_only
            || collect($c->descendantIds())->push($c->id)->contains(fn ($id) => $withProducts->has($id)));

        $latest = collect([$products->max('updated_at'), $categories->max('updated_at')])->filter()->max();

        $add('/', $latest);
        foreach ($categories as $category) {
            $add($category->url(), $category->updated_at);
        }
        foreach ($products as $product) {
            // Image sitemap entries: the largest WebP rendition shown on the page (1200 px), a few per product.
            $images = $product->images->whereNotNull('path')->take(5)
                ->map(fn ($image) => ImageUrl::for($image, 1200))->filter()->values()->all();
            $add($product->url(), $product->updated_at, $images);
        }

        $brands = Brand::query()->active()
            ->whereHas('products', fn ($q) => $q->where('is_published', true)->whereIn('category_id', $activeCategoryIds))
            ->orderBy('position')->get();
        if ($brands->isNotEmpty()) {
            $add('/marques', $brands->max('updated_at'));
        }
        foreach ($brands as $brand) {
            $add($brand->url(), $brand->updated_at);
        }

        $add('/promotions', $latest);

        $articles = Article::query()->published()->orderBy('position')->get();
        if ($articles->isNotEmpty()) {
            $add('/blog', $articles->max('updated_at'));
        }
        ArticleCategory::query()->whereHas('articles', fn ($q) => $q->where('is_published', true))
            ->orderBy('position')->get()
            ->each(fn (ArticleCategory $c) => $add($c->url(), $c->updated_at));
        foreach ($articles as $article) {
            $add($article->url(), $article->updated_at);
        }

        $sectors = SectorPage::query()->published()->orderBy('position')->get();
        $add('/solutions', $sectors->max('updated_at'));
        foreach ($sectors as $sector) {
            $add($sector->url(), $sector->updated_at);
        }

        $services = ServicePage::query()->published()->orderBy('position')->get();
        if ($services->isNotEmpty()) {
            $add('/services', $services->max('updated_at'));
        }
        foreach ($services as $service) {
            $add($service->url(), $service->updated_at);
        }

        // Kind "other" pages (espace-professionnel) hold content for fixed routes listed below.
        Page::query()->published()->where('kind', '!=', PageKind::Other)->orderBy('position')->get()
            ->each(fn (Page $p) => $add($p->url(), $p->updated_at));
        CityPage::query()->published()->get()
            ->each(fn (CityPage $p) => $add($p->url(), $p->updated_at));

        // Fixed pages: their content comes from the settings and the catalogue, so their date is the
        // latest change of either.
        $settingsChanged = DB::table('settings')->max('updated_at');
        $fixedDate = collect([$latest, $settingsChanged ? Carbon::parse($settingsChanged) : null])->filter()->max();
        foreach (['/calculateur-puissance', '/contact', '/demander-un-devis', '/devenir-revendeur', '/plan-du-site'] as $path) {
            $add($path, $fixedDate);
        }
        $add('/espace-professionnel', Page::query()->published()->where('slug', 'espace-professionnel')->first()?->updated_at);

        return response()->json(['data' => $urls->unique('path')->values()]);
    }
}
