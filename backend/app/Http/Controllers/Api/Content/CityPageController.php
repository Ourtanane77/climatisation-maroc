<?php

namespace App\Http\Controllers\Api\Content;

use App\Http\Controllers\Api\Content\Concerns\PresentsContent;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\Product;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * City landing page (/climatisation-<ville>). Not drawn in the design: the front office reuses the
 * Gamme components (type tiles, product cards, FAQ), so this returns the climatisation sub-ranges
 * and featured families next to the page's own text.
 */
class CityPageController extends Controller
{
    use PresentsContent;

    public function show(Request $request, string $slug): JsonResponse
    {
        $page = CityPage::query()->published()->where('slug', $slug)->with(['city', 'seo', 'faqItems'])->firstOrFail();
        $cityName = $page->city->name;

        $range = Category::query()->active()->whereNull('parent_id')->where('slug', 'climatisation')->first();
        $types = $range
            ? $range->children()->public()->orderBy('position')->get()
            : collect();

        $products = $range
            ? Product::query()->published()->whereIn('category_id', $range->descendantIds())
                ->orderByDesc('is_featured')->orderBy('position')->limit(8)
                ->with(['variants', 'images', 'brand'])->get()
            : collect();

        return response()->json([
            'slug' => $page->slug,
            'city' => $cityName,
            'href' => $page->url(),
            'intro' => $page->intro,
            'body' => $page->body,
            'types' => $types->map(fn (Category $c) => [
                'name' => $c->short_name ?: $c->name,
                'text' => $c->tile_text,
                'art' => $c->art_key,
                'bg' => $c->tile_bg,
                'image' => ImageUrl::path($c->image),
                'href' => $c->url(),
            ])->values(),
            'products' => ProductCardResource::collection($products)->resolve($request),
            'faq' => $this->faq($page),
            'seo' => $this->seo($page, "Climatisation {$cityName}"),
            'contact' => $this->contact(),
        ]);
    }
}
