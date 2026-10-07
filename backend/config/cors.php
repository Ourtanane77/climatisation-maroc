<?php

/*
| The API is called server-side by the Next.js front office (same origin behind nginx) and the
| back office is same-origin: no other site may call it from a browser.
*/

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST'],
    'allowed_origins' => array_filter([env('FRONTEND_URL', env('APP_URL'))]),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'Authorization', 'X-Requested-With'],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => false,
];
