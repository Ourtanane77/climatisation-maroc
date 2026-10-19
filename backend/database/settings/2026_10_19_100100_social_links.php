<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Social links given by the owner on 2026-10-19, one set per site (Réglages — <site>). A network is
 * filled only when it is empty or still holds the link seeded on 2026-10-06 (copied to Arfro on
 * 2026-10-12): a link the owner already changed in the back office is kept.
 */
return new class extends SettingsMigration
{
    /** Links of the first settings migration, copied as is to general_arfro. */
    private const SEEDED = [
        'facebook' => 'https://web.facebook.com/maroc.climatisation',
        'instagram' => 'https://www.instagram.com/arihafroid_climatisation/',
        'tiktok' => 'https://www.tiktok.com/@arihafroid_climatisation',
    ];

    private const LINKS = [
        'general' => [
            'facebook' => 'https://www.facebook.com/climatisationmaroc',
            'instagram' => 'https://www.instagram.com/climatisationmaroc',
            'tiktok' => 'https://www.tiktok.com/@climatisationmaroc',
        ],
        'general_arfro' => [
            'facebook' => 'https://www.facebook.com/arfromaroc',
            'instagram' => 'https://www.instagram.com/arfromaroc/',
            'tiktok' => 'https://www.tiktok.com/@arfromaroc',
            'youtube' => 'https://www.youtube.com/@ARFROMaroc',
            'x' => 'https://x.com/ARFROMaroc',
            'threads' => 'https://www.threads.com/@arfromaroc',
            'pinterest' => 'https://www.pinterest.com/arfromaroc/',
        ],
    ];

    public function up(): void
    {
        foreach (self::LINKS as $group => $links) {
            if (! $this->migrator->exists("{$group}.socials")) {
                continue;
            }
            $this->migrator->update("{$group}.socials", function (mixed $socials) use ($links): array {
                $socials = (array) ($socials ?? []); // the migrator decodes the JSON payload as an object
                foreach ($links as $key => $url) {
                    $current = trim((string) ($socials[$key] ?? ''));
                    if ($current === '' || $current === (self::SEEDED[$key] ?? null)) {
                        $socials[$key] = $url;
                    }
                }

                return $socials;
            });
        }
    }
};
