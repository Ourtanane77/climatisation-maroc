<?php

namespace App\Settings;

/** Home page of arfro.com: same fields as HomeSettings, own values (group home_arfro). */
class ArfroHomeSettings extends HomeSettings
{
    public static function group(): string
    {
        return 'home_arfro';
    }
}
