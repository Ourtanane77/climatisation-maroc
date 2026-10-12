<?php

namespace App\Filament\Pages;

use App\Settings\ArfroHomeSettings;

/** Home page of arfro.com: same form, own values (group home_arfro), pickers limited to Arfro. */
class ManageArfroHomeSettings extends ManageHomeSettings
{
    protected static string $settings = ArfroHomeSettings::class;

    protected static ?int $navigationSort = 1;

    public static function siteKey(): string
    {
        return 'arfro';
    }
}
