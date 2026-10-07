<?php

use App\Http\Middleware\CacheApiResponses;
use App\Http\Middleware\FrenchTypographyResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trusted proxies (nginx, the Next.js server) come from config/trustedproxy.php: the private
        // Docker network only, so visitors cannot forge X-Forwarded-For.
        // The only login page served by Laravel is the back office's.
        $middleware->redirectGuestsTo('/admin/login');
        // Public read API cached in Redis (after the rate limiter, which still counts every call).
        // French typography on public reads runs inside the cache, so cached bodies are already fixed.
        $middleware->api(append: [CacheApiResponses::class, FrenchTypographyResponse::class]);
        $middleware->appendToPriorityList(ThrottleRequests::class, CacheApiResponses::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
