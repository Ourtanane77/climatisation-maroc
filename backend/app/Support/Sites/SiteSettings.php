<?php

namespace App\Support\Sites;

use App\Settings\ArfroGeneralSettings;
use App\Settings\ArfroHomeSettings;
use App\Settings\GeneralSettings;
use App\Settings\HomeSettings;
use Spatie\LaravelSettings\Settings;

/**
 * Settings are per site: the default site keeps the original groups (general, home), each other
 * site has a subclass with its own group (general_arfro, home_arfro). Injecting GeneralSettings or
 * HomeSettings gives the current site's values (bound in AppServiceProvider).
 */
final class SiteSettings
{
    /** @var array<class-string<Settings>, array<string, class-string<Settings>>> base => [site => class] */
    public const BINDINGS = [
        GeneralSettings::class => ['arfro' => ArfroGeneralSettings::class],
        HomeSettings::class => ['arfro' => ArfroHomeSettings::class],
    ];

    /**
     * The settings class holding a site's values.
     *
     * @param  class-string<Settings>  $base
     * @return class-string<Settings>
     */
    public static function classFor(string $base, ?string $site = null): string
    {
        return self::BINDINGS[$base][$site ?? Sites::currentKey()] ?? $base;
    }

    /**
     * A fresh settings object with a site's values.
     *
     * @template T of Settings
     *
     * @param  class-string<T>  $base
     * @return T
     */
    public static function for(string $base, ?string $site = null): Settings
    {
        $class = self::classFor($base, $site);

        /** @var T */
        return new $class;
    }
}
