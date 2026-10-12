<?php

namespace App\Filament\Pages;

use App\Settings\ArfroGeneralSettings;

/** "Réglages" of arfro.com: same form, own values (group general_arfro). */
class ManageArfroGeneralSettings extends ManageGeneralSettings
{
    protected static string $settings = ArfroGeneralSettings::class;

    protected static ?int $navigationSort = 3;

    public static function siteKey(): string
    {
        return 'arfro';
    }
}
