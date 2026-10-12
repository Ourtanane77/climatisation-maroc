<?php

namespace App\Support\Frontend;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Brand;
use App\Models\Category;
use App\Models\City;
use App\Models\CityPage;
use App\Models\FaqItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpec;
use App\Models\ProductVariant;
use App\Models\Redirect;
use App\Models\SectorPage;
use App\Models\SeoMeta;
use App\Models\ServicePage;
use App\Support\Api\ApiCache;
use App\Support\Sites\Site;
use App\Support\Sites\Sites;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Spatie\LaravelSettings\Events\SettingsSaved;
use Throwable;

/**
 * Tells the Next.js front offices to drop their cached API data (POST /api/revalidate, tag "api")
 * after the catalogue, content or settings change. Without it, a page that becomes unpublished
 * stays served: Next only caches 200 responses, so the API's 404 never replaces the cached page.
 * Every storefront (config/sites.php) has its own Next.js instance and cache, and they share the
 * catalogue: each one is called, whichever site the change concerns.
 * One round of calls per request or command, sent after the response; failures are logged per
 * site, never fatal.
 */
class Revalidator
{
    /** @var list<class-string> Models whose changes are visible on the public site. */
    public const MODELS = [
        Category::class, Brand::class, Product::class, ProductVariant::class, ProductImage::class,
        ProductSpec::class, Article::class, ArticleCategory::class, SectorPage::class, ServicePage::class,
        CityPage::class, Page::class, FaqItem::class, SeoMeta::class, Redirect::class, City::class,
    ];

    private static bool $pending = false;

    public static function register(): void
    {
        foreach (self::MODELS as $model) {
            foreach (['saved', 'deleted'] as $event) {
                Event::listen("eloquent.{$event}: {$model}", fn () => self::changed());
            }
        }
        Event::listen(SettingsSaved::class, fn () => self::changed());
    }

    /** Public data changed: drop the API response cache now, and the front office's after the response. */
    public static function changed(): void
    {
        ApiCache::flush();
        self::schedule();
    }

    public static function schedule(): void
    {
        if (self::$pending || ! config('shop.revalidate_secret') || app()->runningUnitTests()) {
            return;
        }
        self::$pending = true;
        defer(function () {
            self::$pending = false;
            self::send();
        });
    }

    /**
     * Revalidates every storefront. True only when all of them answered successfully.
     *
     * @param  list<string>  $tags
     */
    public static function send(array $tags = ['api']): bool
    {
        $ok = true;
        foreach (Sites::all() as $site) {
            $ok = self::sendTo($site, $tags) && $ok;
        }

        return $ok;
    }

    /** @param list<string> $tags */
    public static function sendTo(Site $site, array $tags = ['api']): bool
    {
        $url = $site->frontendInternalUrl.'/api/revalidate';
        try {
            $response = Http::timeout(30)
                ->withHeaders(['X-Revalidate-Secret' => (string) config('shop.revalidate_secret')])
                ->post($url, ['tags' => $tags]);
            if (! $response->successful()) {
                Log::warning('Front-office revalidation failed', ['site' => $site->key, 'url' => $url, 'status' => $response->status()]);
            }

            return $response->successful();
        } catch (Throwable $e) {
            Log::warning('Front-office revalidation failed', ['site' => $site->key, 'url' => $url, 'error' => $e->getMessage()]);

            return false;
        }
    }
}
