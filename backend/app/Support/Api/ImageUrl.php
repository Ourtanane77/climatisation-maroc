<?php

namespace App\Support\Api;

use App\Models\ProductImage;
use App\Support\Images\ImageRenditions;
use Illuminate\Support\Facades\Storage;

/**
 * Public image URLs for the front office. Local files are returned as site-relative paths
 * ("/storage/…"): nginx serves them on the same origin as the pages.
 */
class ImageUrl
{
    /** The WebP rendition closest to $width (320/640/1200), else the original; null until downloaded. */
    public static function for(?ProductImage $image, int $width = 640): ?string
    {
        if (! $image?->path) {
            return null;
        }
        $renditions = $image->renditions ?? [];
        ksort($renditions);
        $path = $image->path;
        foreach ($renditions as $w => $renditionPath) {
            $path = $renditionPath;
            if ((int) $w >= $width) {
                break;
            }
        }

        return self::path($path);
    }

    /** `srcset` of the WebP renditions ("url 320w, url 640w, …"), or null until downloaded. */
    public static function srcSet(?ProductImage $image): ?string
    {
        $renditions = $image?->path ? ($image->renditions ?? []) : [];
        if (! $renditions) {
            return null;
        }
        ksort($renditions);

        return collect($renditions)->map(fn (string $path, int|string $w) => self::path($path)." {$w}w")->implode(', ');
    }

    /** Brand logo URL: its small WebP copy (built on first use), else the original file. */
    public static function logo(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        $webp = (new ImageRenditions(Storage::disk(config('filesystems.default'))))->logo($path);

        return self::path($webp ?? $path);
    }

    /** URL of any file on the public disk. */
    public static function path(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        // Each segment URL-encoded, so a file name with a space or "%" still resolves.
        $url = Storage::disk(config('filesystems.default'))->url(implode('/', array_map('rawurlencode', explode('/', $path))));
        $base = rtrim((string) config('app.url'), '/');

        return str_starts_with($url, $base) ? substr($url, strlen($base)) : $url;
    }
}
