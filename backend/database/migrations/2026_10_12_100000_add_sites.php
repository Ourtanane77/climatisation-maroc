<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Two storefronts, one back office (config/sites.php, docs/plan.md §0 "Multi-site").
 *
 * - Content tables get `sites` (json list of site keys) and `site_content` (per-site texts).
 *   Existing rows: the catalogue (categories, brands, products) goes on both sites; editorial
 *   content (articles, pages, sector/service/city pages) stays on Climatisation Maroc only, so
 *   arfro.com does not launch with copied articles (owner's decision, 2026-10-12).
 * - Editorial slugs are unique per site, not globally (an Arfro « a-propos » can exist beside
 *   Climatisation Maroc's); the back office checks it, so the unique indexes become plain ones.
 * - Orders, leads and reseller applications record the site they came from.
 * - Back-office users get the sites they manage (null = all sites).
 */
return new class extends Migration
{
    /** @var array<string, list<string>> table => sites given to existing rows */
    private const CONTENT = [
        'categories' => ['cm', 'arfro'],
        'brands' => ['cm', 'arfro'],
        'products' => ['cm', 'arfro'],
        'article_categories' => ['cm', 'arfro'],
        'articles' => ['cm'],
        'sector_pages' => ['cm'],
        'service_pages' => ['cm'],
        'city_pages' => ['cm'],
        'pages' => ['cm'],
    ];

    /** Tables whose slug becomes unique per site. */
    private const PER_SITE_SLUGS = ['articles', 'sector_pages', 'service_pages', 'city_pages', 'pages'];

    public function up(): void
    {
        foreach (self::CONTENT as $table => $sites) {
            Schema::table($table, function (Blueprint $t) {
                $t->json('sites')->nullable()->comment('Site keys the row appears on (config/sites.php)');
                $t->json('site_content')->nullable()->comment('{site: {field: text}} per-site texts');
            });
            DB::table($table)->update(['sites' => json_encode($sites)]);
        }

        foreach (self::PER_SITE_SLUGS as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropUnique("{$table}_slug_unique");
                $t->index('slug');
            });
        }

        foreach (['orders', 'leads', 'reseller_accounts'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('site', 16)->default('cm')->after('id')->index()->comment('Site the request came from');
            });
        }

        Schema::table('users', function (Blueprint $t) {
            $t->json('sites')->nullable()->comment('Back office: sites managed (null = all)');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('sites'));
        foreach (['orders', 'leads', 'reseller_accounts'] as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropIndex("{$table}_site_index");
                $t->dropColumn('site');
            });
        }
        foreach (self::PER_SITE_SLUGS as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropIndex("{$table}_slug_index");
                $t->unique('slug');
            });
        }
        foreach (array_keys(self::CONTENT) as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn(['sites', 'site_content']));
        }
    }
};
