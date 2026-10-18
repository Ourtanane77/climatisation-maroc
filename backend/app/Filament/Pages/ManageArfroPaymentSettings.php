<?php

namespace App\Filament\Pages;

use App\Settings\ArfroPaymentSettings;

/** « Paiement en ligne » of arfro.com: same form, own values (group payment_arfro). */
class ManageArfroPaymentSettings extends ManagePaymentSettings
{
    protected static string $settings = ArfroPaymentSettings::class;

    public static function siteKey(): string
    {
        return 'arfro';
    }
}
