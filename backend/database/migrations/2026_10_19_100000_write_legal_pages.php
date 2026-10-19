<?php

use App\Models\Page;
use App\Support\Sites\Sites;
use Database\Seeders\Data\LegalPages;
use Illuminate\Database\Migrations\Migration;

/**
 * Writes the legal pages of every storefront on existing installs (owner's request, 2026-10-19):
 * texts in Database\Seeders\Data\LegalPages, shared with ContentSeeder.
 *
 * - Only pages still holding the design placeholder « [TEXTE JURIDIQUE] » (or missing) are
 *   written: text edited in the back office is kept. Arfro gets its own pages.
 * - Pages with an « [À compléter : …] » marker (RC, ICE, host, CNDP…) stay unpublished.
 * - An empty database (fresh install) is left to the seeders.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Page::query()->exists()) {
            return;
        }

        foreach (Sites::keys() as $site) {
            LegalPages::write($site);
        }
    }

    public function down(): void
    {
        // Data only: the texts stay (they may have been edited since).
    }
};
