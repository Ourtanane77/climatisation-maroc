<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\Page;
use App\Models\Product;
use App\Models\SectorPage;
use App\Models\ServicePage;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Short, stable type names in polymorphic columns (SEO, FAQ, article links, lead source).
        Relation::morphMap([
            'user' => User::class,
            'category' => Category::class,
            'brand' => Brand::class,
            'product' => Product::class,
            'article' => Article::class,
            'article_category' => ArticleCategory::class,
            'sector' => SectorPage::class,
            'service' => ServicePage::class,
            'city_page' => CityPage::class,
            'page' => Page::class,
        ]);

        // Pages are rendered by the Next.js server, whose requests come from the private Docker
        // network: those are not limited. Form posts carry the visitor's IP in X-Forwarded-For.
        RateLimiter::for('api-read', fn (Request $request) => self::isInternal($request)
            ? Limit::none()
            : Limit::perMinute(120)->by((string) $request->ip()));
        RateLimiter::for('api-form', fn (Request $request) => [
            Limit::perMinute(5)->by('ip:'.$request->ip()),
            Limit::perMinute(5)->by('phone:'.preg_replace('/\D/', '', (string) $request->input('phone'))),
        ]);
    }

    private static function isInternal(Request $request): bool
    {
        $ip = (string) $request->ip();

        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    }
}
