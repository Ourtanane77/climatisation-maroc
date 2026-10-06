<?php

namespace App\Support\Api;

use App\Models\ProductImage;
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

    /** URL of any file on the public disk. */
    public static function path(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        $url = Storage::disk(config('filesystems.default'))->url($path);
        $base = rtrim((string) config('app.url'), '/');

        return str_starts_with($url, $base) ? substr($url, strlen($base)) : $url;
    }
}
