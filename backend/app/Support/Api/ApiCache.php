<?php

namespace App\Support\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Tagged cache of public API responses (docs/plan.md §5): one tag, flushed as a whole on any
 * catalogue, content or settings change. Only used with a store that supports tags (Redis, array).
 */
class ApiCache
{
    public const TAG = 'api-responses';

    public const TTL = 3600;

    public static function enabled(): bool
    {
        return (bool) config('shop.api_cache', true) && Cache::supportsTags();
    }

    /**
     * Query parameters the public read API understands (listing facets, paging, search, calculator).
     * A request with any other parameter is answered live and never stored, so random parameters
     * (`?r=123`, tracking tags) cannot multiply cache entries.
     */
    public const KNOWN_PARAMS = [
        'power', 'size', 'brand', 'tech', 'fluid', 'colour', 'price', 'promo',
        'sort', 'page', 'per_page', 'flat', 'q', 'range', 'tab', 'category', 'skus', 'path',
        'surface', 'ceiling', 'sun', 'top_floor', 'room',
    ];

    /** Longest search text worth caching. */
    private const MAX_Q = 100;

    /** Whether the request's query string can be cached (known parameters, short search). */
    public static function cacheableQuery(Request $request): bool
    {
        $query = $request->query();

        return array_diff(array_keys($query), self::KNOWN_PARAMS) === []
            && mb_strlen(is_string($query['q'] ?? null) ? $query['q'] : '') <= self::MAX_Q;
    }

    /** Path plus sorted query string: `?a=1&b=2` and `?b=2&a=1` share an entry. */
    public static function key(Request $request): string
    {
        $query = $request->query();
        ksort($query);

        return 'api:'.sha1($request->path().'?'.http_build_query($query));
    }

    /** @return array{status: int, body: string}|null */
    public static function get(string $key): ?array
    {
        try {
            $value = Cache::tags(self::TAG)->get($key);
        } catch (Throwable) {
            return null; // cache down: answer from the database
        }

        return is_array($value) ? $value : null;
    }

    /** @param array{status: int, body: string} $value */
    public static function put(string $key, array $value): void
    {
        try {
            Cache::tags(self::TAG)->put($key, $value, self::TTL);
        } catch (Throwable) {
            // Cache down: the response is still served.
        }
    }

    public static function flush(): void
    {
        if (! self::enabled()) {
            return;
        }
        try {
            Cache::tags(self::TAG)->flush();
        } catch (Throwable) {
            // Cache down: entries expire on their own (TTL).
        }
    }
}
