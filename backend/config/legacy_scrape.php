<?php

/*
| Rules for `php artisan catalog:scrape-legacy` (old site → data/catalog.json).
| Reviewed with the client before each import: see storage/app/legacy/scrape-report.md.
*/

return [

    'base_url' => env('LEGACY_SITE_URL', 'https://climatisationmaroc.com'),

    // Old category id (URL /produit/service/{id}/…) → catalogue category slug (config/catalog.php
    // category_map turns it into the new category path). Ids without products are left out.
    'categories' => [
        3 => 'mono-split',
        4 => 'gainable',
        5 => 'cassette',
        7 => 'console-armoire',
        8 => 'chauffe-eau-gaz',
        9 => 'chauffe-eau-electrique',
        10 => 'chauffe-eau-solaire',
        11 => 'chaudiere',
        12 => 'froid',
        13 => 'pieces-de-rechange',
        14 => 'ventilation',
        15 => 'gaines-circulaires',
        25 => 'cuivre',
        26 => 'gaz-frigorifique',
        27 => 'grilles',
    ],

    // Brand pages (/produit/marque/{id}/…) also read, for products no category page lists.
    // Value: the brand of that page when the page is reliable, else null (brand from the name).
    'brand_pages' => [
        4 => null, 24 => null, 27 => null, 29 => 'carrier', 31 => null, 32 => 'gs', 33 => null, 34 => null,
        35 => 'simsek', 36 => 'fitco', 38 => 'soudal', 39 => 'alpha', 41 => null, 43 => null, 45 => 'ciat', 46 => 'arfro',
    ],

    // Category of a product found only on a brand page, from its name (first match wins).
    'name_categories' => [
        '/GAINABLE/i' => 'gainable',
        '/CASSETTE/i' => 'cassette',
        '/ARMOIRE|CONSOLE/i' => 'console-armoire',
        '/MURAL/i' => 'mono-split',
        '/^CUIVRE/i' => 'cuivre',
        '/^KIT DUO/i' => 'cuivre',
        '/^FLEXIBLE/i' => 'gaines-circulaires',
        '/^GAINES? CIRCULAIRE/i' => 'gaines-circulaires',
        '/^VENTILATEUR DE GAINE/i' => 'ventilation',
        '/^(DIFFUSEUR|GRILLE|VENTEUSE)/i' => 'grilles',
        '/^GAZ/i' => 'gaz-frigorifique',
        '/T[EÉ]L[EÉ]COMMANDE/iu' => 'pieces-de-rechange',
    ],
    // Unmatched names go here and are flagged « à vérifier ».
    'fallback_category' => 'pieces-de-rechange',

    // The brand logo on old product pages is not reliable in these categories (the copper pages
    // show LG): the brand then comes from the product name only.
    'brand_logo_trusted' => [25 => false, 27 => false, 15 => false, 13 => false],

    // Per old product id: category_slug, brand_slug, verify (note shown in the back office) or skip.
    'overrides' => [
        // Old category "Froid" also lists air conditioners and accessories.
        684 => ['category_slug' => 'mono-split'],
        685 => ['category_slug' => 'mono-split'],
        703 => ['category_slug' => 'mono-split'],
        449 => ['category_slug' => 'pieces-de-rechange'],
        510 => ['category_slug' => 'pieces-de-rechange', 'verify' => 'Classé dans « Froid » sur l’ancien site ; catégorie à confirmer.'],
        // A service sold as a product on the old site: the new site offers it as a checkout option.
        702 => ['skip' => 'service (visite technique), proposé comme option de commande sur le nouveau site'],
        // Reference "ESBO" is the brand, not a product reference.
        367 => ['verify' => 'Référence « ESBO » sur l’ancien site (c’est la marque) : vraie référence à saisir.'],
    ],

];
