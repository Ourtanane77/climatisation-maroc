<?php

namespace App\Support\Api;

use App\Models\User;

/**
 * Who is asking: anonymous visitors and customers get public prices; a validated reseller
 * (Sanctum bearer token forwarded by the Next.js server) gets pro prices where set.
 * Responses that depend on it must never be cached publicly.
 */
class Audience
{
    public static function user(): ?User
    {
        $user = auth('sanctum')->user();

        return $user instanceof User ? $user : null;
    }

    public static function isReseller(): bool
    {
        return (bool) self::user()?->isValidatedReseller();
    }
}
