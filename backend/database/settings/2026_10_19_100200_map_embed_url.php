<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Google Maps map of the contact page (owner's request of 2026-10-19): the « ARFRO » place, the same
 * store on both sites. Editable per site in Réglages, section « Contact ».
 */
return new class extends SettingsMigration
{
    private const URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.4047309297084!2d-7.990787888134776!3d31.65014507404711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafefea414aac07%3A0xc50205eec02ae1c!2sARFRO!5e0!3m2!1sfr!2sma!4v1792428423780!5m2!1sfr!2sma';

    public function up(): void
    {
        foreach (['general', 'general_arfro'] as $group) {
            if (! $this->migrator->exists("{$group}.map_embed_url")) {
                $this->migrator->add("{$group}.map_embed_url", self::URL);
            }
        }
    }
};
