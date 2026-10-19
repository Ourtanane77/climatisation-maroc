<?php

namespace App\Support\Sites;

/**
 * Google Maps embed address of the contact page (Réglages « map_embed_url »). Only the `src` of the
 * iframe Google gives (Partager → Intégrer une carte) is accepted: https, host www.google.com, path
 * /maps/embed, a query string, no credentials, port, fragment, spaces or quotes. Checked when the
 * back office saves the field and again before the API outputs it.
 */
final class MapEmbed
{
    public static function isValid(?string $url): bool
    {
        if ($url === null || $url === '' || strlen($url) > 2048 || preg_match('/[\s"\'<>\\\\]/', $url)) {
            return false;
        }
        $parts = parse_url($url);
        if ($parts === false) {
            return false;
        }

        return ($parts['scheme'] ?? null) === 'https'
            && ($parts['host'] ?? null) === 'www.google.com'
            && ($parts['path'] ?? null) === '/maps/embed'
            && ($parts['query'] ?? '') !== ''
            && ! isset($parts['user']) && ! isset($parts['pass']) && ! isset($parts['port']) && ! isset($parts['fragment']);
    }

    /** The URL when valid, null otherwise (nothing is rendered). */
    public static function sanitize(?string $url): ?string
    {
        $url = $url === null ? null : trim($url);

        return self::isValid($url) ? $url : null;
    }
}
