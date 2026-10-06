<?php

/*
| Rules used to turn data/catalog.json (one row per SKU, as on the old site) into product
| families with variants, and to place them in the new category tree.
| Reviewed with the client: docs/catalog-grouping.md.
*/

return [

    // Snapshot of the old site's catalogue (mounted at /var/www/data in Docker).
    'source' => env('CATALOG_JSON', base_path('../data/catalog.json')),

    // Old category slug → new category path.
    'category_map' => [
        'climatisation' => 'climatisation',
        'mono-split' => 'climatisation/mural',
        'gainable' => 'climatisation/gainable',
        'cassette' => 'climatisation/cassette',
        'console-armoire' => 'climatisation/console-armoire',
        'chauffe-eau' => 'chauffe-eau',
        'chauffe-eau-gaz' => 'chauffe-eau/gaz',
        'chauffe-eau-electrique' => 'chauffe-eau/electrique',
        'chauffe-eau-solaire' => 'chauffe-eau/solaire',
        'chaudiere' => 'chauffe-eau/chaudiere',
        'ventilation' => 'ventilation',
        'gaines-circulaires' => 'gaines',
        'pieces-de-rechange' => 'pieces-de-rechange',
        'accessoires' => 'cuivre-et-gaz',
        'cuivre' => 'cuivre-et-gaz/cuivre',
        'grilles' => 'ventilation/grilles-et-diffuseurs',
        'gaz-frigorifique' => 'cuivre-et-gaz/gaz-frigorifique',
        'froid' => 'froid',
    ],

    // Within a range, products are moved to a sub-category by name (first match wins);
    // anything unmatched stays at range level.
    'subcategory_rules' => [
        'ventilation' => [
            '/^Multizone/i' => 'ventilation/multizone',
            '/^Ventilateur de gaine/i' => 'ventilation/ventilateurs-de-gaine',
        ],
        'gaines' => [
            '/Flexible souple/i' => 'gaines/flexibles-souples',
            '/Flexible (calorifug|isol)/i' => 'gaines/flexibles-isoles',
        ],
        'pieces-de-rechange' => [
            '/T[ée]l[ée]commande/iu' => 'pieces-de-rechange/telecommandes',
            '/^(Support|Silent Bloc)/i' => 'pieces-de-rechange/supports',
            '/^(Scotch|Bande|Mastic|Mousse|Colle|Silicone)/i' => 'pieces-de-rechange/adhesifs-et-mastics',
            '/^Trappe de visite/i' => 'pieces-de-rechange/trappes-de-visite',
            '/^(Pompe [àa] vide|Gaz Chalumeau|Collier)/iu' => 'pieces-de-rechange/outillage',
        ],
    ],

    /*
    | Family grouping: the row name minus the parts below must match (same brand too).
    | Colour is a variant attribute only for air conditioners; Carrier Miroir is black by name.
    | Diameter variants only for the listed families (accessories stay separate: decision 4).
    */
    'grouping' => [
        'power_pattern' => '/\s(\d{1,2}) ?000 BTU\b/u',
        'colour_categories' => ['climatisation/mural', 'climatisation/gainable', 'climatisation/cassette', 'climatisation/console-armoire'],
        'colour_exceptions' => ['/^Carrier Miroir/i'],
        'capacity_pattern' => '/\s(\d{3}) L\b/u',
        'diameter_families' => ['/^Ventilateur de Gaine Q\d+ Nanyo/i', '/^Multizone Q\d+/i', '/^Flexible Souple Q\d+ Esbo/i'],
        'diameter_pattern' => '/\sQ(\d{2,3})\b/u',
        'strip_after_diameter' => ['/\sDPT[\w-]+/u'],
    ],

    // SKUs seeded as they are but flagged "à vérifier" (client decisions of 2026-10-06).
    'verify' => [
        '42HY48VSA' => 'Référence suspecte : indique 48 mais la puissance (18 000 BTU) et le prix sont cohérents avec la gamme. À vérifier.',
        'FSW18T23PW/N' => 'Coloris Noir mais référence en « PW » (habituellement blanc). À vérifier.',
        'UA13MUH0.MJO' => 'Probable faute de frappe sur l’ancien site (les autres Artcool finissent par NJ0 ; image nommée UA13MJH0). À vérifier.',
    ],

];
