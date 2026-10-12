<?php

namespace App\Http\Middleware;

use App\Support\Sites\Sites;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets the storefront of an API request from the X-Site header sent by the Next.js server
 * (unknown or missing = the default site).
 */
class ResolveSite
{
    public const HEADER = 'X-Site';

    public function handle(Request $request, Closure $next): Response
    {
        Sites::setCurrent($request->header(self::HEADER));

        return $next($request);
    }
}
