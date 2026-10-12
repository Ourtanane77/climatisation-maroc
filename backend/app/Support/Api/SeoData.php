<?php

namespace App\Support\Api;

use App\Models\SeoMeta;
use App\Support\Sites\Site;
use App\Support\Sites\Sites;
use Illuminate\Database\Eloquent\Model;

/**
 * SEO fields of a page for the current site: the per-site override (`site_content[site]` keys
 * seo_title, seo_description, seo_h1, see App\Models\Concerns\HasSites) wins over the shared
 * seo_meta row. Canonical URLs never point at the other storefront.
 */
final class SeoData
{
    public static function title(Model $owner): ?string
    {
        return self::override($owner, 'seo_title') ?? self::meta($owner)?->title;
    }

    public static function description(Model $owner): ?string
    {
        return self::override($owner, 'seo_description') ?? self::meta($owner)?->description;
    }

    public static function h1(Model $owner): ?string
    {
        return self::override($owner, 'seo_h1') ?? self::meta($owner)?->h1;
    }

    public static function noindex(Model $owner): bool
    {
        return (bool) self::meta($owner)?->noindex;
    }

    public static function canonical(Model $owner): ?string
    {
        return self::url(self::meta($owner)?->canonical);
    }

    /**
     * A canonical as entered in the back office, for the current site: a relative path stays as is;
     * an absolute URL on one of the storefronts' domains is moved to the current site's domain
     * (Climatisation Maroc's canonical must not send arfro.com's pages to climatisationmaroc.com).
     */
    public static function url(?string $canonical): ?string
    {
        $canonical = trim((string) $canonical);
        if ($canonical === '') {
            return null;
        }
        $host = parse_url($canonical, PHP_URL_HOST);
        if (! is_string($host)) {
            return $canonical;
        }
        $ours = Sites::all()->contains(fn (Site $site) => strcasecmp((string) parse_url($site->url, PHP_URL_HOST), $host) === 0);
        if (! $ours) {
            return $canonical;
        }
        $path = (string) parse_url($canonical, PHP_URL_PATH);
        $query = parse_url($canonical, PHP_URL_QUERY);

        return Sites::current()->url($path).(is_string($query) && $query !== '' ? '?'.$query : '');
    }

    private static function meta(Model $owner): ?SeoMeta
    {
        // The HasSeo relation (loaded on first access).
        $seo = $owner->getAttribute('seo');

        return $seo instanceof SeoMeta ? $seo : null;
    }

    private static function override(Model $owner, string $key): ?string
    {
        return method_exists($owner, 'siteOverride') ? $owner->siteOverride($key) : null;
    }
}
