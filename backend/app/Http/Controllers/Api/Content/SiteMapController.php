<?php

namespace App\Http\Controllers\Api\Content;

use App\Enums\PageKind;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\Page;
use App\Models\SectorPage;
use App\Models\ServicePage;
use Illuminate\Http\JsonResponse;

/**
 * Content for the HTML "Plan du site" (design/Plan du site.dc.html). Only active categories and
 * published pages are listed; the front office adds its own fixed routes (panier, devis…).
 */
class SiteMapController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $ranges = Category::query()->public()->roots()->orderBy('position')
            ->with(['children' => fn ($q) => $q->whereIn('id', Category::query()->public()->select('id'))->orderBy('position')])->get();

        $link = fn (string $title, string $href) => ['title' => $title, 'href' => $href];

        return response()->json([
            'ranges' => $ranges->map(fn (Category $c) => [
                'title' => $c->name,
                'href' => $c->url(),
                'quoteOnly' => (bool) $c->is_quote_only,
                'children' => $c->children->map(fn (Category $s) => $link($s->short_name ?: $s->name, $s->url()))->values(),
            ])->values(),
            'services' => ServicePage::query()->published()->orderBy('position')->get()
                ->map(fn (ServicePage $s) => $link($s->name, $s->url()))->values(),
            'sectors' => SectorPage::query()->published()->orderBy('position')->get()
                ->map(fn (SectorPage $s) => $link($s->name, $s->url()))->values(),
            'blogCategories' => ArticleCategory::query()->whereHas('articles', fn ($q) => $q->where('is_published', true))
                ->orderBy('position')->get()
                ->map(fn (ArticleCategory $c) => $link($c->name, $c->url()))->values(),
            'articles' => Article::query()->published()->orderBy('position')->get()
                ->map(fn (Article $a) => $link($a->title, $a->url()))->values(),
            'pages' => Page::query()->published()->where('kind', '!=', PageKind::Other)->orderBy('kind')->orderBy('position')->get()
                ->map(fn (Page $p) => [...$link($p->title, $p->url()), 'kind' => $p->kind->value])->values(),
            'cities' => CityPage::query()->published()->with('city')->get()
                ->map(fn (CityPage $p) => $link($p->city->name, $p->url()))->values(),
        ]);
    }
}
