<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Pro routes: the Sanctum user must be a reseller whose account is validated. */
class EnsureValidatedReseller
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user instanceof User || ! $user->isValidatedReseller()) {
            return response()->json(['message' => 'Accès réservé aux comptes revendeurs validés.'], 403);
        }

        return $next($request);
    }
}
