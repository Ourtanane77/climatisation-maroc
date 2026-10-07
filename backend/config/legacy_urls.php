<?php

/*
| Old site (climatisationmaroc.com) URLs → new paths, used by GET /api/v1/redirects/legacy.
| Product, category and brand URLs carry the old ids and are resolved from the database
| (product_variants.legacy_id, categories.legacy_id, brand name); the fixed paths are listed here.
| A row in the back-office "Redirections" table always wins over these rules.
*/

return [

    // /produit/{segment}/… (old listing shortcuts and shop pages).
    'produit' => [
        'cuivre' => '/cuivre-et-gaz/cuivre',
        'gaz' => '/cuivre-et-gaz/gaz-frigorifique',
        'grille' => '/ventilation/grilles-et-diffuseurs',
        'panier' => '/panier',
        'promotions' => '/promotions',
    ],

    // /home/{segment} (old static pages).
    'home' => [
        '' => '/',
        'contact' => '/contact',
        'devis' => '/demander-un-devis',
        'revendeur' => '/devenir-revendeur',
        'conditionsgeneralesdevente' => '/cgv',
        'conditionsgeneralesdutilisation' => '/cgu',
        'informationslegales' => '/informations-legales',
        'politiqueconfidentialite' => '/confidentialite',
        'securite' => '/securite',
    ],

];
