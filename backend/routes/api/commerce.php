<?php

use App\Http\Controllers\Api\Commerce\CartController;
use App\Http\Controllers\Api\Commerce\OrderController;
use App\Http\Controllers\Api\Commerce\PaymentController;
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

Route::get('/checkout/options', [OrderController::class, 'options'])->middleware('throttle:api-read')->name('api.checkout.options');

// Online card payment (CMI). The payment page asks for the signed form; CMI posts the callback
// (server to server) and sends the customer's browser back to /retour. No X-Site header there:
// the site is the order's.
Route::post('/orders/{reference}/payment', [PaymentController::class, 'form'])
    ->middleware('throttle:api-read')
    ->where('reference', '[A-Za-z]{2,5}-\d{4}-\d{5}')
    ->name('api.orders.payment');
// The callback is not rate limited: a refused callback would void a genuine payment (CMI calls
// from a few addresses), and an unsigned one costs a hash check and an id-only audit row.
Route::post('/payments/cmi/callback', [PaymentController::class, 'callback'])->name('api.payments.cmi.callback');
Route::post('/payments/cmi/retour', [PaymentController::class, 'back'])->middleware('throttle:cmi')->name('api.payments.cmi.return');
