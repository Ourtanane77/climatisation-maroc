<?php

namespace App\Http\Middleware;

use App\Support\Api\ApiCache;
use App\Support\Api\Audience;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Symfony\Component\HttpFoundation\Response;

/**
 * Caches the public read API (routes throttled by `api-read`) in the tagged cache (Redis), for
 * everyone who sends no bearer token: a reseller's pro prices are never cached or served from the
 * cache. Entries are flushed whenever the catalogue, content or settings change (ApiCache::flush,
 * called from App\Support\Frontend\Revalidator), and expire after an hour anyway.
 */
class CacheApiResponses
{
    /** Read routes whose answer must stay live: redirect hit counters, order pages (token). */
    private const EXCLUDED = ['api.resolve', 'api.orders.show'];

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->cacheable($request)) {
            return $next($request);
        }

        $key = ApiCache::key($request);
        $cached = ApiCache::get($key);
        if ($cached !== null) {
            return response($cached['body'], $cached['status'], ['Content-Type' => 'application/json', 'X-Api-Cache' => 'HIT']);
        }

        $response = $next($request);
        if ($response->getStatusCode() === 200 && str_contains((string) $response->headers->get('Content-Type'), 'json')) {
            ApiCache::put($key, ['status' => 200, 'body' => (string) $response->getContent()]);
            $response->headers->set('X-Api-Cache', 'MISS');
        }

        return $response;
    }

    private function cacheable(Request $request): bool
    {
        $route = $request->route();

        return $request->isMethod('GET')
            && ! $request->bearerToken()
            && Audience::user() === null
            && ApiCache::enabled()
            && ApiCache::cacheableQuery($request)
            && $route instanceof Route
            && ! in_array($route->getName(), self::EXCLUDED, true)
            && in_array('throttle:api-read', $route->gatherMiddleware(), true);
    }
}
