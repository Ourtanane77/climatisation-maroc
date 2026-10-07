<?php

namespace App\Http\Middleware;

use App\Support\Text\FrenchTypography;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies French typography (App\Support\Text\FrenchTypography) to the text of public API reads,
 * in one place for every page: product names, specs, category and page copy, FAQ, articles…
 * Technical values (references, links, slugs, filter values, contact details) are left untouched.
 */
class FrenchTypographyResponse
{
    /** Keys whose values are identifiers, links or contact details, never prose. */
    private const SKIP = [
        'sku', 'skus', 'href', 'url', 'path', 'slug', 'src', 'srcset', 'srcSet', 'image', 'images', 'logo',
        'email', 'phone', 'tel', 'telHref', 'whatsapp', 'value', 'key', 'id', 'token', 'reference', 'ref',
        'query', 'q', 'mapQuery', 'canonical', 'type', 'kind', 'template', 'icon', 'art', 'scene', 'bg',
        'colour', 'color', 'lastmod', 'date', 'publishedAt', 'updatedAt', 'createdAt', 'status', 'to',
        'renditions', 'datasheet', 'number', 'display', 'legacy', 'tone', 'caption_key',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET') || ! $response instanceof JsonResponse || $response->getStatusCode() !== 200) {
            return $response;
        }

        $response->setData($this->walk($response->getData(true)));

        return $response;
    }

    private function walk(mixed $value, ?string $key = null): mixed
    {
        if (is_string($value)) {
            return $key !== null && in_array($key, self::SKIP, true) ? $value : FrenchTypography::apply($value);
        }
        if (is_array($value)) {
            // Keys of a skipped field are skipped with all their children (e.g. "images": [...]).
            if ($key !== null && in_array($key, self::SKIP, true)) {
                return $value;
            }
            foreach ($value as $k => $v) {
                $value[$k] = $this->walk($v, is_string($k) ? $k : $key);
            }
        }

        return $value;
    }
}
