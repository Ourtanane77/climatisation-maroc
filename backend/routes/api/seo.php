<?php

use App\Http\Controllers\Api\Seo\LegacyRedirectController;
use App\Http\Controllers\Api\Seo\SitemapController;
use Illuminate\Support\Facades\Route;

/* SEO endpoints (docs/plan.md §5): sitemap.xml data and old-site URL redirects. */

Route::middleware('throttle:api-read')->group(function () {
    Route::get('/sitemap', SitemapController::class)->name('api.sitemap');
    Route::get('/redirects/legacy', LegacyRedirectController::class)->name('api.redirects.legacy');
});
