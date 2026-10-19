<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Shop-wide settings edited in Réglages: phones by role, stores, hours, socials,
 * WhatsApp numbers (main, home hero, floating button), contact page map, top promo bar, technical visit price.
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

    /**
     * Numbers behind the home hero « WhatsApp » button: [{label, number}] (number in international
     * format without "+", label optional). Empty or a single number: one direct link (whatsapp_number
     * when empty); two or more: a small menu (App\Support\Sites\WhatsAppNumbers). Typed for PHPStan
     * only: spatie's cast resolver cannot handle nested arrays, so there is no @var.
     *
     * @phpstan-var array<int, array{label?: string|null, number?: string|null}>
     */
    public array $hero_whatsapp_numbers;

    /** Number of the floating WhatsApp button shown on every storefront page; null = no button. */
    public ?string $floating_whatsapp_number;

    /** Displayed sales number, e.g. 0666-854184. */
    public string $sales_phone;

    /**
     * Stores: [{name, address}].
     *
     * @phpstan-var array<int, array{name: string, address: string}>
     */
    public array $stores;

    public string $hours;

    /** @var array<string, string> facebook, instagram, tiktok, youtube, x, threads, pinterest URLs (App\Support\Sites\SocialLinks) */
    public array $socials;

    /** Google Maps embed address of the contact page (App\Support\Sites\MapEmbed); null = default map. */
    public ?string $map_embed_url;

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
