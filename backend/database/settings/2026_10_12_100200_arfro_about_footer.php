<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * arfro.com's footer presentation: the same facts as Climatisation Maroc's, its own wording (no
 * duplicate text across the two sites). Only replaces the copied Climatisation Maroc text, never a
 * text the owner already edited in « Réglages — Arfro ».
 */
return new class extends SettingsMigration
{
    private const COPIED = 'Climatisation Maroc est un site e-commerce spécialisé dans la vente des systèmes de climatisation, avec livraison gratuite sur tout le Maroc. Le site est une propriété de la société Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008, pour les professionnels comme les particuliers.';

    private const ARFRO = 'Arfro est la boutique en ligne d\'Ariha Froid, spécialiste de la climatisation et du froid à Marrakech depuis 2008. Particuliers et professionnels y trouvent leurs systèmes de climatisation, livrés gratuitement partout au Maroc.';

    public function up(): void
    {
        if ($this->migrator->exists('general_arfro.about_footer')) {
            $this->migrator->update('general_arfro.about_footer', fn (?string $text) => $text === null || $text === self::COPIED ? self::ARFRO : $text);
        }
    }
};
