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
use Illuminate\Database\Eloquent\Relations\Relation;
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
    }
}
