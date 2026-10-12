<?php

namespace App\Support\Sites;

/** One storefront from config/sites.php. */
final readonly class Site
{
    public function __construct(
        public string $key,
        public string $name,
        public string $url,
        public string $frontendInternalUrl,
        public string $orderPrefix,
        public string $mailFromName,
    ) {}

    /** @param array<string, mixed> $config */
    public static function fromConfig(string $key, array $config): self
    {
        return new self(
            key: $key,
            name: (string) $config['name'],
            url: rtrim((string) $config['url'], '/'),
            frontendInternalUrl: rtrim((string) $config['frontend_internal_url'], '/'),
            orderPrefix: (string) $config['order_prefix'],
            mailFromName: (string) $config['mail_from_name'],
        );
    }

    public function isDefault(): bool
    {
        return $this->key === Sites::defaultKey();
    }

    /** Absolute front-office URL, for links in e-mails. */
    public function url(string $path = '/'): string
    {
        return $this->url.'/'.ltrim($path, '/');
    }
}
