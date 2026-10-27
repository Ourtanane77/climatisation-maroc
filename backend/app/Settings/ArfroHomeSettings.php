<?php

namespace App\Settings;

/**
 * Home page of arfro.com: the fields of HomeSettings (hero, product rails, brand order, mega menu)
 * with their own values (group home_arfro), plus the editorial home of the owner's brief
 * (docs/arfro-creative-brief.md, 13 sections, back office « Page d’accueil — Arfro »). Each section
 * is one array: `enabled`, texts, CTAs, image (`image` = upload on the public disk, `design_image` =
 * one of the site's own photos, App\Support\Home\ArfroHomeContent::DESIGN_IMAGES) and its list.
 * The API shape is built by ArfroHomeContent. (`@phpstan-var`, not `@var`: spatie/laravel-settings
 * cannot cast `mixed`.)
 */
class ArfroHomeSettings extends HomeSettings
{
    /**
     * Fields: eyebrow, title, text, cta_*, secondary_*, image, design_image
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_hero;

    /**
     * Fields: eyebrow, title, text, cta_*, image, design_image
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_manifesto;

    /**
     * Fields: eyebrow, title, text, items[key, title, text, cta_label, cta_url, image, design_image]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_environments;

    /**
     * Fields: eyebrow, title, text, image, design_image, items[icon, title, text, url]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_technology;

    /**
     * Fields: eyebrow, title, text, cta_*, collections[label, category, product_ids]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_products;

    /**
     * Fields: eyebrow, title, text, cta_*, image, design_image, items[icon, title, text, cta_label, cta_url]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_care;

    /**
     * Fields: eyebrow, title, text (the advisor itself is built in the frontend)
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_advisor;

    /**
     * Fields: eyebrow, title, text, items[title, location, type, products, description, image, published]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_projects;

    /**
     * Fields: eyebrow, title, text, cta_*, secondary_*, image, design_image, items[title, text]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_business;

    /**
     * Fields: eyebrow, title, text (logos: brand_ids)
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_brands;

    /**
     * Fields: eyebrow, title, text, items[icon, title, text]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_trust;

    /**
     * Fields: eyebrow, title, items[author, location, type, products, quote, image, published]
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_testimonials;

    /**
     * Fields: eyebrow, title, text, cta_* (articles: the site's published articles)
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_journal;

    /**
     * Fields: eyebrow, title, text, cta_*, secondary_*, image, design_image
     *
     * @phpstan-var array<string, mixed>
     */
    public array $section_final;

    public static function group(): string
    {
        return 'home_arfro';
    }
}
