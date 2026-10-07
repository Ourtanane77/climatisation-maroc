<?php

use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\ResolveController;
use Illuminate\Support\Facades\Route;

/*
| REST API for the Next.js front office, prefixed /api/v1 (see bootstrap/app.php).
| The contract is documented in docs/plan.md §5. Each domain has its own route file in routes/api/.
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]))->name('api.health');

Route::middleware('throttle:api-read')->group(function () {
    Route::get('/resolve', ResolveController::class)->name('api.resolve');
    Route::get('/cities', CityController::class)->name('api.cities');
});

foreach (['catalog', 'products', 'commerce', 'leads', 'home', 'content', 'seo'] as $domain) {
    if (is_file($file = __DIR__."/api/{$domain}.php")) {
        require $file;
    }
}
