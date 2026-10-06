<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/** Home page sections (Page d'accueil): hero, product rails, promotions, brand order. */
class HomeSettings extends Settings
{
    public string $hero_title;

    public ?string $hero_subtitle;

    public ?string $hero_image;

    public ?string $hero_cta_label;

    public ?string $hero_cta_url;

    /** @var list<int> product ids for "Nouveaux produits" */
    public array $new_product_ids;

    /** @var list<int> product ids for the "Promotions" rail */
    public array $promo_product_ids;

    /** @var list<int> product ids for the "Gaines circulaires" rail */
    public array $ducts_product_ids;

    /** @var list<int> product ids for "Cuivre, gaz et pièces de rechange" */
    public array $supplies_product_ids;

    /** @var list<int> brand ids, in marquee order */
    public array $brand_ids;

    /** @var array<string, int> category key → featured product id in the mega menu */
    public array $mega_featured;

    public static function group(): string
    {
        return 'home';
    }
}
