<?php

namespace App\Models\Concerns;

use App\Support\Sites\Sites;
use Illuminate\Database\Eloquent\Builder;

/**
 * Visibility per storefront and per-site texts.
 *
 * - `sites` (json list of site keys): the sites the record appears on. A record with no site
 *   appears nowhere, like an unpublished one.
 * - `site_content` (json {site: {field: text}}): optional texts replacing a field on one site, so
 *   the two sites do not publish the same copy (duplicate content). Empty = the main field.
 *   The fields a model accepts are listed in its SITE_TEXT_FIELDS constant; SEO overrides use the
 *   keys seo_title, seo_description and seo_h1.
 * - A row created without `sites` (seeders, imports) gets the model's DEFAULT_SITES, else every
 *   site; the back office always sets it.
 *
 * @property list<string>|null $sites
 * @property array<string, array<string, string|null>>|null $site_content
 */
trait HasSites
{
    public static function bootHasSites(): void
    {
        static::creating(function (self $model) {
            $model->sites ??= static::defaultSites();
        });
    }

    public function initializeHasSites(): void
    {
        $this->mergeCasts(['sites' => 'array', 'site_content' => 'array']);
    }

    /** @return list<string> */
    public static function defaultSites(): array
    {
        return defined(static::class.'::DEFAULT_SITES') ? constant(static::class.'::DEFAULT_SITES') : Sites::keys();
    }

    /** @return list<string> Fields accepting a per-site text, besides the SEO ones. */
    public static function siteTextFields(): array
    {
        return defined(static::class.'::SITE_TEXT_FIELDS') ? constant(static::class.'::SITE_TEXT_FIELDS') : [];
    }

    /**
     * Records shown on a site (default: the current one).
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeVisibleOn(Builder $query, ?string $site = null): Builder
    {
        return $query->whereJsonContains($this->qualifyColumn('sites'), $site ?? Sites::currentKey());
    }

    public function isVisibleOn(?string $site = null): bool
    {
        return in_array($site ?? Sites::currentKey(), $this->sites ?? [], true);
    }

    /** The field's text on a site: its override when filled, else the main field. */
    public function siteText(string $field, ?string $site = null): mixed
    {
        return $this->siteOverride($field, $site) ?? $this->getAttribute($field);
    }

    /** The override alone: null when empty. */
    public function siteOverride(string $field, ?string $site = null): ?string
    {
        $value = $this->site_content[$site ?? Sites::currentKey()][$field] ?? null;

        return is_string($value) && trim(strip_tags($value)) !== '' ? $value : null;
    }
}
