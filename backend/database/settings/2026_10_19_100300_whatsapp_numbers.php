<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * WhatsApp numbers requested by the owner on 2026-10-19 for Climatisation Maroc: two numbers behind the
 * home hero « WhatsApp » button and a floating WhatsApp button on every storefront page. Arfro gets the
 * fields empty (hero keeps its single number, no floating button) until the owner fills them in
 * Réglages, section « Contact ».
 */
return new class extends SettingsMigration
{
    private const VALUES = [
        'general' => [
            'hero_whatsapp_numbers' => [
                ['label' => '', 'number' => '212666854184'],
                ['label' => '', 'number' => '212666088348'],
            ],
            'floating_whatsapp_number' => '212666774394',
        ],
        'general_arfro' => [
            'hero_whatsapp_numbers' => [],
            'floating_whatsapp_number' => null,
        ],
    ];

    public function up(): void
    {
        foreach (self::VALUES as $group => $values) {
            foreach ($values as $name => $value) {
                if (! $this->migrator->exists("{$group}.{$name}")) {
                    $this->migrator->add("{$group}.{$name}", $value);
                }
            }
        }
    }
};
