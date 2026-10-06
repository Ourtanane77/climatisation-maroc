<?php

namespace App\Support\Leads;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Cheap anti-spam for public forms (docs/plan.md §5): the hidden `website` field must stay empty
 * and the form must have been open at least 3 seconds (`_t`, milliseconds since it was shown,
 * sent by the front office). A suspicious post gets the normal success response but is not stored,
 * so bots learn nothing.
 */
class FormGuard
{
    public const MIN_MILLISECONDS = 3000;

    public static function isSpam(Request $request): bool
    {
        $honeypot = trim((string) $request->input('website', '')) !== '';
        $elapsed = (int) $request->input('_t', 0);
        $spam = $honeypot || $elapsed < self::MIN_MILLISECONDS;

        if ($spam) {
            Log::info('Form submission dropped by the anti-spam guard', [
                'path' => $request->path(),
                'ip' => $request->ip(),
                'honeypot' => $honeypot,
                'elapsed_ms' => $elapsed,
            ]);
        }

        return $spam;
    }
}
