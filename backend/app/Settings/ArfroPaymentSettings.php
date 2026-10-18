<?php

namespace App\Settings;

/** « Paiement en ligne » of arfro.com: same fields as PaymentSettings, own values (group payment_arfro). */
class ArfroPaymentSettings extends PaymentSettings
{
    public static function group(): string
    {
        return 'payment_arfro';
    }
}
