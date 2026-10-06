<?php

use App\Http\Controllers\Api\Catalog\CategoryController;
use App\Http\Controllers\Api\Catalog\NavigationController;
use App\Http\Controllers\Api\Catalog\PromotionController;
use App\Http\Controllers\Api\Catalog\SearchController;
use Illuminate\Support\Facades\Route;

/* Catalogue listings (docs/plan.md §5). Public GET routes use throttle:api-read. */

Route::middleware('throttle:api-read')->group(function () {
    Route::get('/navigation', NavigationController::class)->name('api.navigation');
    Route::get('/categories/{path}/products', [CategoryController::class, 'products'])
        ->where('path', '[a-z0-9\-/]+')->name('api.categories.products');
    Route::get('/categories/{path}', [CategoryController::class, 'show'])
        ->where('path', '[a-z0-9\-/]+')->name('api.categories.show');
    Route::get('/promotions', PromotionController::class)->name('api.promotions');
    Route::get('/search/suggest', [SearchController::class, 'suggest'])->name('api.search.suggest');
    Route::get('/search', [SearchController::class, 'index'])->name('api.search');
});
