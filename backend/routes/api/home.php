<?php

use App\Http\Controllers\Api\Blog\ArticleController;
use App\Http\Controllers\Api\Blog\BlogController;
use App\Http\Controllers\Api\Home\CalculatorController;
use App\Http\Controllers\Api\Home\HomeController;
use Illuminate\Support\Facades\Route;

/* home endpoints (docs/plan.md §5): home page, power calculator, blog. Public GET routes use throttle:api-read. */

Route::middleware('throttle:api-read')->group(function () {
    Route::get('/home', HomeController::class)->name('api.home');
    Route::get('/calculator/power', [CalculatorController::class, 'power'])->name('api.calculator.power');
    Route::get('/calculator/products', [CalculatorController::class, 'products'])->name('api.calculator.products');
    Route::get('/blog', BlogController::class)->name('api.blog.index');
    Route::get('/blog/{slug}', ArticleController::class)->where('slug', '[a-z0-9-]+')->name('api.blog.show');
});
