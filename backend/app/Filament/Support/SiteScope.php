<?php

namespace App\Filament\Support;

use App\Models\User;
use App\Support\Sites\Sites;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Back-office view of the storefronts: which sites the signed-in user manages, and the query
 * scopes limiting the lists to them (a user restricted to Arfro only sees Arfro's orders and the
 * content shown on Arfro). Admins and unrestricted users see everything.
 */
final class SiteScope
{
    /** @return list<string> Sites managed by the signed-in user (every site without a user, e.g. console). */
    public static function managed(): array
    {
        $user = auth()->user();

        return $user instanceof User ? $user->managedSites() : Sites::keys();
    }

    public static function manages(string $site): bool
    {
        return in_array($site, self::managed(), true);
    }

    /** True when the user manages a subset of the sites only. */
    public static function restricted(): bool
    {
        return count(self::managed()) < count(Sites::keys());
    }

    /** @return array<string, string> key => name of the managed sites. */
    public static function options(): array
    {
        return array_intersect_key(Sites::options(), array_flip(self::managed()));
    }

    /**
     * Orders, leads, reseller accounts: rows of the managed sites.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public static function records(Builder $query, string $column = 'site'): Builder
    {
        return self::restricted() ? $query->whereIn($query->qualifyColumn($column), self::managed()) : $query;
    }

    /**
     * Content and catalogue (HasSites): rows shown on a managed site, or on no site at all (so a
     * hidden record can still be found and put back online).
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public static function content(Builder $query): Builder
    {
        if (! self::restricted()) {
            return $query;
        }
        $column = $query->qualifyColumn('sites');

        return $query->where(function (Builder $q) use ($column) {
            $q->whereNull($column)->orWhereJsonLength($column, 0);
            foreach (self::managed() as $site) {
                $q->orWhereJsonContains($column, $site);
            }
        });
    }

    /** Badge colour of a site: the default site in the brand blue, the others in distinct colours. */
    public static function color(?string $site): string
    {
        if ($site === null || ! Sites::exists($site)) {
            return 'gray';
        }
        if ($site === Sites::defaultKey()) {
            return 'primary';
        }
        $others = array_values(array_diff(Sites::keys(), [Sites::defaultKey()]));
        $palette = ['warning', 'success', 'danger', 'info'];

        return $palette[(int) array_search($site, $others, true) % count($palette)];
    }

    public static function name(?string $site): string
    {
        return Sites::options()[$site] ?? (string) $site;
    }

    /** « de Climatisation Maroc », « d’Arfro ». */
    public static function ofName(string $site): string
    {
        $name = self::name($site);

        return (preg_match('/^[aeiouyhâàéèêîôûAEIOUYHÂÀÉÈÊÎÔÛ]/u', $name) ? 'd’' : 'de ').$name;
    }
}
