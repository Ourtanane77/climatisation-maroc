<?php

use App\Http\Controllers\Api\Leads\LeadController;
use App\Http\Controllers\Api\Leads\ResellerApplicationController;
use App\Http\Controllers\Api\Pro\AuthController;
use App\Http\Controllers\Api\Pro\ProLandingController;
use App\Http\Controllers\Api\Pro\QuickOrderController;
use App\Http\Middleware\EnsureValidatedReseller;
use Illuminate\Support\Facades\Route;

/* leads endpoints (docs/plan.md §5). Public GET routes use throttle:api-read, form POST routes throttle:api-form. */

Route::middleware('throttle:api-form')->group(function () {
    Route::post('/leads/quote', [LeadController::class, 'quote'])->name('api.leads.quote');
    Route::post('/leads/contact', [LeadController::class, 'contact'])->name('api.leads.contact');
    Route::post('/leads/sector', [LeadController::class, 'sector'])->name('api.leads.sector');
    Route::post('/leads/stock-alert', [LeadController::class, 'stockAlert'])->name('api.leads.stock-alert');
    Route::post('/resellers/apply', ResellerApplicationController::class)->name('api.resellers.apply');

    Route::post('/auth/login', [AuthController::class, 'login'])->name('api.auth.login');
    Route::post('/auth/forgot', [AuthController::class, 'forgot'])->name('api.auth.forgot');
    Route::post('/auth/reset', [AuthController::class, 'reset'])->name('api.auth.reset');
});

Route::get('/pro/landing', ProLandingController::class)->middleware('throttle:api-read')->name('api.pro.landing');

Route::middleware(['auth:sanctum', EnsureValidatedReseller::class, 'throttle:api-read'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
    Route::get('/pro/frequent-refs', [QuickOrderController::class, 'frequent'])->name('api.pro.frequent');
    Route::get('/pro/references', [QuickOrderController::class, 'references'])->name('api.pro.references');
    Route::post('/pro/quick-order/resolve', [QuickOrderController::class, 'resolve'])->name('api.pro.resolve');
});
