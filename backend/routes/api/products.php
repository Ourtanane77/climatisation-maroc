<?php

use App\Http\Controllers\Api\Products\BrandController;
use App\Http\Controllers\Api\Products\CompareController;
use App\Http\Controllers\Api\Products\ProductController;
use Illuminate\Support\Facades\Route;

/* Product page, comparison and brands (docs/plan.md §5). Public GET routes use throttle:api-read. */

Route::middleware('throttle:api-read')->group(function () {
    Route::get('/products/compare', CompareController::class)->name('api.products.compare');
    Route::get('/products/{slug}', [ProductController::class, 'show'])->name('api.products.show');
    Route::get('/brands', [BrandController::class, 'index'])->name('api.brands.index');
    Route::get('/brands/{slug}', [BrandController::class, 'show'])->name('api.brands.show');
});
