<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Legacy URL redirect (old path → new path, 301). */
class Redirect extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['last_hit_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::saving(function (Redirect $redirect) {
            $redirect->from_path = self::normalize($redirect->from_path);
        });
    }

    /** Leading slash, no trailing slash, no host, lower-cased path (query string dropped). */
    public static function normalize(string $path): string
    {
        $path = parse_url($path, PHP_URL_PATH) ?: '/';

        return '/'.trim(mb_strtolower(rawurldecode($path)), '/');
    }
}
