<?php

/*
| Proxies whose X-Forwarded-* headers are trusted (read by Laravel's TrustProxies middleware).
| Only the private Docker network by default: nginx and the Next.js server. A visitor can
| therefore not forge X-Forwarded-For to dodge the rate limits or pass as the internal Next
| server. Behind a TLS terminator outside that network, add its address in TRUSTED_PROXIES
| (comma-separated IPs or CIDR ranges).
*/

return [
    // An empty TRUSTED_PROXIES (docker-compose.prod.yml passes "" when it is not set) means the default.
    'proxies' => array_values(array_filter(array_map('trim', explode(',', (string) (env('TRUSTED_PROXIES')
        ?: '10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,127.0.0.1,::1'))))),
];
