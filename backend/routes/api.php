<?php

use Illuminate\Support\Facades\Route;

/*
| REST API for the Next.js front office, prefixed /api/v1 (see bootstrap/app.php).
| The contract is documented in docs/plan.md §5.
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]))->name('api.health');
