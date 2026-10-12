<?php

/*
| Storefronts served by this back office (docs/plan.md §0, "Multi-site"). One database, one API,
| one back office; each Next.js instance sends its key in the X-Site header. The default site
| answers requests without a header, console commands and the back office.
|
| order_prefix: order references are <prefix>-YYYY-NNNNN, numbered per prefix.
*/

return [
    'default' => 'cm',

    'sites' => [
        'cm' => [
            'name' => 'Climatisation Maroc',
            'url' => env('SITE_CM_URL', env('FRONTEND_URL', env('APP_URL'))),
            'frontend_internal_url' => env('SITE_CM_INTERNAL_URL', env('FRONTEND_INTERNAL_URL', 'http://next:3000')),
            'order_prefix' => 'CM',
            'mail_from_name' => env('SITE_CM_MAIL_FROM_NAME', 'Climatisation Maroc'),
        ],
        'arfro' => [
            'name' => 'Arfro',
            'url' => env('SITE_ARFRO_URL', 'https://arfro.com'),
            'frontend_internal_url' => env('SITE_ARFRO_INTERNAL_URL', 'http://next-arfro:3000'),
            'order_prefix' => 'AR',
            'mail_from_name' => env('SITE_ARFRO_MAIL_FROM_NAME', 'Arfro'),
        ],
    ],
];
