<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Online card payment through the CMI gateway (Centre Monétique Interbancaire), edited in
 * « Paiement en ligne ». Payment on delivery is always offered; card payment only when enabled
 * and configured. The store key is encrypted at rest with APP_KEY and never sent to the browser.
 */
class PaymentSettings extends Settings
{
    public bool $cmi_enabled;

    /** production | test */
    public string $cmi_mode;

    /** Merchant id (ClientId) given by CMI. */
    public string $cmi_client_id;

    /** Hash key (« clé du magasin ») set by the merchant in the CMI back office. */
    public ?string $cmi_store_key;

    public static function group(): string
    {
        return 'payment';
    }

    /** @return list<string> */
    public static function encrypted(): array
    {
        return ['cmi_store_key'];
    }
}
