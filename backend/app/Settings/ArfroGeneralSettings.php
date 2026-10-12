<?php

namespace App\Settings;

/** Réglages of arfro.com: same fields as GeneralSettings, own values (group general_arfro). */
class ArfroGeneralSettings extends GeneralSettings
{
    public static function group(): string
    {
        return 'general_arfro';
    }
}
