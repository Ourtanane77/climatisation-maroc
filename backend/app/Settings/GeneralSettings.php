<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Shop-wide settings edited in Réglages: phones by role, stores, hours, socials,
 * WhatsApp number, top promo bar, technical visit price.
 */
class GeneralSettings extends Settings
{
    /**
     * Phones by role: [{label, display}]. Typed for PHPStan only: spatie's cast resolver
     * cannot handle nested arrays, so there is no @var.
     *
     * @phpstan-var array<int, array{label: string, display: string}>
     */
    public array $phones;

    public string $email;

    /** WhatsApp number in international format without "+", e.g. 212666854184. */
    public string $whatsapp_number;

    /** Displayed sales number, e.g. 0666-854184. */
    public string $sales_phone;

    /**
     * Stores: [{name, address}].
     *
     * @phpstan-var array<int, array{name: string, address: string}>
     */
    public array $stores;

    public string $hours;

    /** @var array<string, string> facebook, instagram, tiktok URLs */
    public array $socials;

    public ?string $promo_bar_text;

    public ?string $promo_bar_link_label;

    public ?string $promo_bar_link_url;

    /** Centimes. */
    public int $technical_visit_price;

    public string $about_footer;

    public static function group(): string
    {
        return 'general';
    }
}
