<?php

namespace App\Http\Controllers\Api\Seo;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Redirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Where an old-site URL now lives (GET /redirects/legacy?path=), for the Next.js legacy routes
 * (/produit/details/…, /produit/service/…, /produit/marque/…, /produit/{cuivre|gaz|…}, /home/…).
 *
 * - A back-office redirect row for the exact path wins.
 * - Products by variant legacy id (family page, `?v=<sku>` when it has several variants);
 *   categories by legacy id, else by the range name in the URL; brands by name.
 * - A target that exists but is not online yet (unpublished page, inactive category) answers a
 *   302 to the closest live page, so browsers do not cache it; real moves answer 301.
 */
class LegacyRedirectController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $path = Redirect::normalize((string) $request->query('path', '/'));

        $manual = Redirect::query()->where('from_path', $path)->first();
        if ($manual) {
            $manual->increment('hits', 1, ['last_hit_at' => now()]);

            return $this->to($manual->to_path, (int) $manual->status_code);
        }

        $segments = array_values(array_filter(explode('/', trim($path, '/')), fn ($s) => $s !== ''));
        [$first, $second] = [$segments[0] ?? '', $segments[1] ?? ''];

        $target = match (true) {
            $first === 'produit' && $second === 'details' => $this->product((int) ($segments[2] ?? 0)),
            $first === 'produit' && $second === 'service' => $this->category((int) ($segments[2] ?? 0), $segments[3] ?? null),
            $first === 'produit' && $second === 'marque' => $this->brand($segments[3] ?? ''),
            $first === 'produit' => $this->fixed('produit', $second),
            $first === 'home' => $this->page($second),
            default => null,
        };

        return $target ? $this->to(...$target) : response()->json(['type' => 'none'], 404);
    }

    /** @return array{0: string, 1: int}|null */
    private function product(int $legacyId): ?array
    {
        if ($legacyId <= 0) {
            return null;
        }
        // Old product ids are kept per variant (one old product row = one SKU).
        $variant = ProductVariant::query()->where('legacy_id', $legacyId)->with('product.category')->first();
        $product = $variant?->product;
        if (! $variant || ! $product) {
            return null;
        }
        if (! $product->is_published || ! $product->category?->is_active) {
            return $product->category?->is_active ? [$product->category->url(), 302] : ['/', 302];
        }
        $several = $product->variants()->count() > 1;

        return [$product->url().($several ? '?v='.rawurlencode($variant->sku) : ''), 301];
    }

    /** @return array{0: string, 1: int}|null */
    private function category(int $legacyId, ?string $rangeName): ?array
    {
        $category = $legacyId > 0 ? Category::query()->where('legacy_id', $legacyId)->first() : null;
        if ($category?->is_active) {
            // An empty category (no published product yet) would be a soft 404: send the old URL to
            // the nearest ancestor that has products, temporarily, until the category is stocked.
            $target = $this->nearestStocked($category);

            return $target === $category ? [$category->url(), 301] : [$target->url(), 302];
        }
        // Unknown old id: the range named in the URL ("Chauffe eau", "Piece de rechange").
        $slug = Str::slug((string) $rangeName);
        $range = $slug === '' ? null : Category::query()->active()->roots()
            ->whereIn('slug', [$slug, Str::plural($slug), preg_replace('/^piece-/', 'pieces-', $slug)])->first();

        return $range ? [$range->url(), 301] : ($category ? ['/', 302] : null);
    }

    /** @return array{0: string, 1: int}|null */
    private function brand(string $name): ?array
    {
        $brand = Brand::query()->where('slug', Str::slug(rawurldecode($name)))->first();
        if (! $brand) {
            return null;
        }

        return $brand->is_active ? [$brand->url(), 301] : ['/marques', 302];
    }

    /** @return array{0: string, 1: int}|null */
    private function fixed(string $group, string $segment): ?array
    {
        $to = config("legacy_urls.{$group}")[$segment] ?? null;

        return is_string($to) ? [$to, 301] : null;
    }

    /** @return array{0: string, 1: int}|null */
    private function page(string $segment): ?array
    {
        $to = config('legacy_urls.home')[$segment] ?? null;
        if (! is_string($to)) {
            return null;
        }
        // Static pages managed in the back office: only a published one is a permanent target.
        $slug = ltrim($to, '/');
        $managed = Page::query()->where('slug', $slug)->first();
        if ($managed && ! $managed->is_published) {
            return ['/', 302];
        }

        return [$to, 301];
    }

    private function to(string $to, int $status): JsonResponse
    {
        return response()->json(['type' => 'redirect', 'to' => $to, 'status' => $status]);
    }

    /** The category itself when it (or a sub-category) has a published product, else its closest such ancestor. */
    private function nearestStocked(Category $category): Category
    {
        $current = $category;
        while ($current) {
            $hasProducts = $current->is_quote_only || Product::query()->published()
                ->whereIn('category_id', $current->descendantIds())->exists();
            if ($hasProducts || $current->parent_id === null) {
                return $current;
            }
            $current = $current->parent;
        }

        return $category;
    }
}
