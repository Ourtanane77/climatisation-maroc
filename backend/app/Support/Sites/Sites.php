<?php

namespace App\Support\Sites;

use Illuminate\Support\Collection;
use InvalidArgumentException;

/**
 * The storefronts (config/sites.php) and the one the current request is for. The API sets it from
 * the X-Site header (App\Http\Middleware\ResolveSite); queued mails and commands use runAs() with
 * the site stored on the order or lead. Everything else uses the default site.
 */
final class Sites
{
    private static ?string $current = null;

    /** @return Collection<string, Site> */
    public static function all(): Collection
    {
        return collect((array) config('sites.sites'))->map(fn (array $config, string $key) => Site::fromConfig($key, $config));
    }

    /** @return list<string> */
    public static function keys(): array
    {
        return array_keys((array) config('sites.sites'));
    }

    /** @return array<string, string> key => name, for back-office selects. */
    public static function options(): array
    {
        return self::all()->map(fn (Site $site) => $site->name)->all();
    }

    public static function defaultKey(): string
    {
        return (string) config('sites.default', self::keys()[0] ?? 'cm');
    }

    public static function exists(?string $key): bool
    {
        return $key !== null && array_key_exists($key, (array) config('sites.sites'));
    }

    public static function get(?string $key = null): Site
    {
        $key ??= self::defaultKey();
        if (! self::exists($key)) {
            throw new InvalidArgumentException("Unknown site [{$key}].");
        }

        return Site::fromConfig($key, (array) config("sites.sites.{$key}"));
    }

    public static function current(): Site
    {
        return self::get(self::currentKey());
    }

    public static function currentKey(): string
    {
        return self::$current ?? self::defaultKey();
    }

    /** Unknown or null key = the default site. */
    public static function setCurrent(?string $key): void
    {
        self::$current = self::exists($key) ? $key : null;
        // Settings are resolved per site (AppServiceProvider): drop the instances already resolved.
        foreach (array_keys(SiteSettings::BINDINGS) as $base) {
            app()->forgetInstance($base);
        }
    }

    /**
     * Runs a callback as if the request were for this site (queued mails, commands).
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    public static function runAs(?string $key, callable $callback): mixed
    {
        $previous = self::$current;
        self::setCurrent($key);
        try {
            return $callback();
        } finally {
            self::setCurrent($previous);
        }
    }
}
