<?php

namespace App\Support\Sites;

/**
 * Social networks of Réglages (`socials` keys), in the order of the footer icons and of the
 * back-office fields, with the name the storefront uses (front-end `Social.name`).
 */
final class SocialLinks
{
    public const NETWORKS = [
        'facebook' => 'Facebook',
        'instagram' => 'Instagram',
        'tiktok' => 'TikTok',
        'youtube' => 'YouTube',
        'x' => 'X',
        'threads' => 'Threads',
        'pinterest' => 'Pinterest',
    ];

    /**
     * Filled networks only, in the stable order above; anything but an http(s) URL is skipped.
     *
     * @param  array<string, string|null>  $socials
     * @return list<array{name: string, href: string}>
     */
    public static function list(array $socials): array
    {
        $links = [];
        foreach (self::NETWORKS as $key => $name) {
            $href = trim((string) ($socials[$key] ?? ''));
            if ($href !== '' && preg_match('#^https?://#i', $href)) {
                $links[] = ['name' => $name, 'href' => $href];
            }
        }

        return $links;
    }
}
