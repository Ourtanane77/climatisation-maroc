<?php

use App\Http\Controllers\Api\Commerce\CartController;
use App\Http\Controllers\Api\Commerce\OrderController;
use Illuminate\Support\Facades\Route;

/* commerce endpoints (docs/plan.md §5). Public GET routes use throttle:api-read, form POST routes throttle:api-form. */

// Re-quoted on every basket change: read limits, not form limits.
Route::post('/cart/quote', [CartController::class, 'quote'])->middleware('throttle:api-read')->name('api.cart.quote');

Route::middleware('throttle:api-form')->group(function () {
    Route::post('/orders', [OrderController::class, 'store'])->name('api.orders.store');
    Route::post('/orders/track', [OrderController::class, 'track'])->name('api.orders.track');
});

Route::get('/orders/{reference}', [OrderController::class, 'show'])
    ->middleware('throttle:api-read')
    // <site prefix>-YYYY-NNNNN (config/sites.php order_prefix: CM, AR…).
    ->where('reference', '[A-Za-z]{2,5}-\d{4}-\d{5}')
    ->name('api.orders.show');
