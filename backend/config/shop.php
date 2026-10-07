<?php

return [

    /*
    | Front office (Next.js) URLs: public base for links in e-mails, internal base for
    | on-demand revalidation calls.
    */
    'frontend_url' => env('FRONTEND_URL', env('APP_URL')),
    'frontend_internal_url' => env('FRONTEND_INTERNAL_URL', 'http://next:3000'),
    'revalidate_secret' => env('REVALIDATE_SECRET'),
    // Public read API responses cached in Redis (App\Http\Middleware\CacheApiResponses).
    'api_cache' => (bool) env('API_CACHE', true),

    // Shop inbox for new orders and leads.
    'notification_email' => env('SHOP_NOTIFICATION_EMAIL', 'ecom@arihafroid.com'),

    // Accounts created by the seeders (first install / development).
    'seed' => [
        'admin_email' => env('SEED_ADMIN_EMAIL'),
        'admin_password' => env('SEED_ADMIN_PASSWORD'),
        'manager_email' => env('SEED_MANAGER_EMAIL'),
        'manager_password' => env('SEED_MANAGER_PASSWORD'),
        'reseller_password' => env('SEED_RESELLER_PASSWORD'),
    ],

];
