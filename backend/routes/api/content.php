<?php

use App\Http\Controllers\Api\Content\CityPageController;
use App\Http\Controllers\Api\Content\PageController;
use App\Http\Controllers\Api\Content\SectorController;
use App\Http\Controllers\Api\Content\ServiceController;
use App\Http\Controllers\Api\Content\SiteMapController;
use Illuminate\Support\Facades\Route;

/* content endpoints (docs/plan.md §5). Public GET routes use throttle:api-read, form POST routes throttle:api-form. */

Route::middleware('throttle:api-read')->group(function () {
    Route::get('/sectors', [SectorController::class, 'index'])->name('api.sectors.index');
    Route::get('/sectors/{slug}', [SectorController::class, 'show'])->name('api.sectors.show');
    Route::get('/services', [ServiceController::class, 'index'])->name('api.services.index');
    Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('api.services.show');
    Route::get('/pages/{slug}', [PageController::class, 'show'])->name('api.pages.show');
    Route::get('/cities/{slug}', [CityPageController::class, 'show'])->name('api.city-pages.show');
    Route::get('/site-map', SiteMapController::class)->name('api.site-map');
});
