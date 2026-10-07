<?php

namespace App\Console\Commands;

use App\Support\Catalog\CatalogImporter;
use App\Support\Catalog\LegacyNames;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Reads the old site (climatisationmaroc.com) and merges what it sells into the catalogue snapshot:
 * products missing from data/catalog.json are added in the same format; products already there are
 * compared (prices) and reported, never overwritten. Writes storage/app/private/legacy/catalog.json and
 * storage/app/private/legacy/scrape-report.md; copy the catalogue to data/catalog.json after review, then
 * reseed (ReferenceSeeder, CatalogSeeder) and run catalog:download-images.
 * Rules (old category → slug, per-product overrides, skipped rows) live in config/legacy_scrape.php.
 */
#[Signature('catalog:scrape-legacy {--delay=600 : Milliseconds between requests} {--update-prices : Apply the current prices of the old site to products already in the catalogue}')]
#[Description('Scrape the old site and merge its products into a copy of data/catalog.json')]
class ScrapeLegacyCatalog extends Command
{
    /** @var list<string> */
    private array $report = [];

    public function handle(): int
    {
        $config = config('legacy_scrape');
        $catalog = CatalogImporter::make()->load();
        /** @var list<array<string, mixed>> $products */
        $products = $catalog['products'];
        $known = collect($products)->keyBy('legacy_id');
        $skus = collect($products)->pluck('sku')->map(fn ($s) => mb_strtolower((string) $s))->flip();

        // 1. Listings: every old category page lists its products with name, reference and prices.
        $listed = [];
        foreach ($config['categories'] as $oldId => $slug) {
            $html = $this->fetch("/produit/service/{$oldId}/x/x");
            foreach ($this->parseListing($html) as $row) {
                $listed[$row['legacy_id']] ??= [...$row, 'old_category' => $oldId, 'category_slug' => $slug];
            }
        }
        // Brand pages list some products that no category page shows (gainables, cassettes…):
        // their category comes from the name (config legacy_scrape.name_categories).
        foreach ($config['brand_pages'] as $brandPage => $brandSlug) {
            foreach ($this->parseBrandListing($this->fetch("/produit/marque/{$brandPage}/x")) as $row) {
                if (isset($listed[$row['legacy_id']])) {
                    continue;
                }
                $slug = $this->categoryFromName($row['name'], $config['name_categories']);
                $listed[$row['legacy_id']] = [...$row, 'old_category' => null, 'category_slug' => $slug ?? $config['fallback_category'], 'brand_page' => $brandSlug, 'unsure_category' => $slug === null];
            }
        }
        $this->info(count($listed).' produits listés sur l’ancien site.');

        // 2. Existing products: price differences are reported, and applied with --update-prices
        //    (owner's decision of 2026-10-07: the old site's current prices win).
        $update = (bool) $this->option('update-prices');
        foreach ($catalog['products'] as &$p) {
            $row = $listed[$p['legacy_id']] ?? null;
            // Products without photos (broken old product page) take the listing card's photos.
            if ($row && empty($p['images']) && ! empty($row['images'])) {
                $p['images'] = $row['images'];
                $this->note("Photos ajoutées depuis la liste pour {$p['sku']} ({$p['name']})");
            }
            if ($row && ((float) $p['price'] !== $row['price'] || (float) ($p['promo_price'] ?? 0) !== (float) ($row['promo_price'] ?? 0))) {
                $this->note(($update ? 'Prix mis à jour' : 'Prix différent')." pour {$p['sku']} ({$p['name']}) : catalogue {$p['price']} / {$p['promo_price']}, ancien site {$row['price']} / {$row['promo_price']}");
                if ($update) {
                    $p['price'] = $row['price'];
                    $p['promo_price'] = $row['promo_price'];
                }
            }
        }
        unset($p);
        foreach ($known as $id => $p) {
            if (! isset($listed[$id])) {
                $this->note("Plus listé sur l’ancien site : {$p['sku']} ({$p['name']})");
            }
        }

        // 3. New products: detail page for images and brand logo, then a catalogue record.
        $nextId = (int) collect($products)->max('id') + 1;
        $added = [];
        foreach ($listed as $id => $row) {
            if ($known->has($id)) {
                continue;
            }
            $override = $config['overrides'][$id] ?? [];
            if (($override['skip'] ?? false) !== false) {
                $this->note("Ignoré : #{$id} {$row['name']} ({$row['sku']}) : {$override['skip']}");

                continue;
            }
            if ($skus->has(mb_strtolower($row['sku']))) {
                $this->note("Ignoré : #{$id} {$row['name']} : la référence {$row['sku']} existe déjà pour un autre produit.");

                continue;
            }
            $detail = $this->parseDetail($this->fetch("/produit/details/{$id}/x"));
            $name = LegacyNames::normalize($row['name']);
            $added[] = [
                'id' => $nextId++,
                'legacy_id' => $id,
                'name' => $name,
                'slug' => Str::slug($name),
                'sku' => $row['sku'],
                'category_slug' => $override['category_slug'] ?? $row['category_slug'],
                'brand_slug' => $override['brand_slug']
                    ?? LegacyNames::brand($name, null, false)
                    ?? ($row['brand_page'] ?? null)
                    ?? LegacyNames::brand($name, $detail['logo_brand'], $row['old_category'] !== null && ($config['brand_logo_trusted'][$row['old_category']] ?? true)),
                'price' => $row['price'],
                'promo_price' => $row['promo_price'],
                'btu' => LegacyNames::btu($name),
                'stock_status' => 'en_stock',
                'is_active' => true,
                'is_featured' => false,
                'is_new' => false,
                'short_description' => null,
                'description' => '',
                'specs' => [],
                // Some old product pages are broken (PHP error): fall back to the listing card's photo.
                'images' => $detail['images'] ?: $row['images'],
                'verify_note' => $override['verify'] ?? (($row['unsure_category'] ?? false) ? 'Trouvé seulement sur une page marque de l’ancien site : catégorie à confirmer.' : null),
            ];
            $skus->put(mb_strtolower($row['sku']), true);
            $this->line("  + {$row['sku']} {$name}");
        }

        // 4. Old category ids on the catalogue's categories (redirects of the old category URLs).
        foreach ($catalog['categories'] as &$category) {
            if ($category['legacy_id'] === null && ($legacyId = array_search($category['slug'], $config['categories'], true)) !== false) {
                $category['legacy_id'] = $legacyId;
            }
        }
        unset($category);

        $catalog['products'] = [...$catalog['products'], ...$added];
        $catalog['scraped_at'] = now()->toIso8601String();
        // Same layout as data/catalog.json (one-space indent), so the diff only shows real changes.
        $json = (string) json_encode($catalog, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $json = (string) preg_replace_callback('/^(?: {4})+/m', fn ($m) => str_repeat(' ', intdiv(strlen($m[0]), 4)), $json);
        Storage::disk('local')->put('legacy/catalog.json', $json."\n");
        Storage::disk('local')->put('legacy/scrape-report.md', $this->reportMarkdown($added));

        $this->info(count($added).' produits ajoutés. Catalogue : storage/app/private/legacy/catalog.json ; rapport : storage/app/private/legacy/scrape-report.md');

        return self::SUCCESS;
    }

    private function fetch(string $path): string
    {
        usleep((int) $this->option('delay') * 1000);
        $url = rtrim((string) config('legacy_scrape.base_url'), '/').str_replace(' ', '%20', $path);

        return Http::withHeaders(['User-Agent' => 'ClimatisationMaroc-migration/1.0'])
            ->timeout(60)->retry(3, 2000)->get($url)->throw()->body();
    }

    /** @return list<array{legacy_id: int, name: string, sku: string, price: float, promo_price: float|null, images: list<string>}> */
    private function parseListing(string $html): array
    {
        $rows = [];
        // Card photos (primary and hover), by product id: used when the product page is broken.
        $cardImages = [];
        preg_match_all('#href="[^"]*/produit/details/(\d+)/[^"]*"\s+class="product-img">(.*?)</a>#s', $html, $cards, PREG_SET_ORDER);
        foreach ($cards as [, $cardId, $cardHtml]) {
            preg_match_all('#data-src="(https?://[^"]+/prodimg/[^"]+)"#', $cardHtml, $srcs);
            $cardImages[(int) $cardId] = array_values(array_unique(array_map(fn ($u) => str_replace(' ', '%20', $u), $srcs[1])));
        }
        preg_match_all('#<div class="product-name">\s*<a[^>]+href="[^"]*/produit/details/(\d+)/[^"]*">(.*?)<br>\s*(.*?)</a>.*?<div class="product-price">(.*?)</div>#s', $html, $matches, PREG_SET_ORDER);
        foreach ($matches as [, $id, $name, $sku, $priceHtml]) {
            preg_match('#class="old-price">\s*([\d.,]+)#', $priceHtml, $old);
            preg_match('#class="price">\s*([\d.,]+)#', $priceHtml, $current);
            $price = isset($current[1]) ? (float) str_replace(',', '', $current[1]) : null;
            $oldPrice = isset($old[1]) ? (float) str_replace(',', '', $old[1]) : null;
            if ($price === null) {
                continue;
            }
            $rows[] = [
                'legacy_id' => (int) $id,
                'name' => trim(html_entity_decode(strip_tags($name), ENT_QUOTES | ENT_HTML5, 'UTF-8')),
                'sku' => trim(html_entity_decode(strip_tags($sku), ENT_QUOTES | ENT_HTML5, 'UTF-8')),
                // Same convention as catalog.json: price = regular, promo_price = current selling price.
                'price' => $oldPrice ?? $price,
                'promo_price' => $oldPrice !== null ? $price : null,
                'images' => $cardImages[(int) $id] ?? [],
            ];
        }

        return $rows;
    }

    /**
     * Brand pages use another card layout: name in .tag, reference in .tittle, price "11300.00 DH"
     * followed by the struck regular price when on promotion.
     *
     * @return list<array{legacy_id: int, name: string, sku: string, price: float, promo_price: float|null, images: list<string>}>
     */
    private function parseBrandListing(string $html): array
    {
        $rows = [];
        preg_match_all('#<article.*?</article>#s', $html, $articles);
        foreach ($articles[0] as $card) {
            if (! preg_match('#/produit/details/(\d+)/#', $card, $id)
                || ! preg_match('#class="tag">([^<]*)<#', $card, $name)
                || ! preg_match('#class="price">\s*([\d.,]+)\s*DH(?:\s*<span class="line-through">\s*([\d.,]+))?#', $card, $price)) {
                continue;
            }
            preg_match('#class="tittle">([^<]*)<#', $card, $sku);
            preg_match_all('#src="(https?://[^"]+/prodimg/[^"]+)"#', $card, $cardImages);
            $current = (float) str_replace(',', '', $price[1]);
            $old = isset($price[2]) ? (float) str_replace(',', '', $price[2]) : null;
            $rows[] = [
                'legacy_id' => (int) $id[1],
                'name' => trim(html_entity_decode($name[1], ENT_QUOTES | ENT_HTML5, 'UTF-8')),
                'sku' => trim(html_entity_decode($sku[1] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8')),
                'price' => $old ?? $current,
                'promo_price' => $old !== null ? $current : null,
                'images' => array_values(array_unique(array_map(fn ($u) => str_replace(' ', '%20', $u), $cardImages[1]))),
            ];
        }

        return $rows;
    }

    /** @param array<string, string> $rules regex => catalogue category slug */
    private function categoryFromName(string $name, array $rules): ?string
    {
        foreach ($rules as $pattern => $slug) {
            if (preg_match($pattern, $name)) {
                return $slug;
            }
        }

        return null;
    }

    /** @return array{images: list<string>, logo_brand: string|null} */
    private function parseDetail(string $html): array
    {
        preg_match_all('#data-image="(https?://[^"]+/prodimg/[^"]+)"#', $html, $images);
        preg_match('#<img[^>]+src="[^"]*/marque/([A-Za-z&]+)-[^"]*"#', $html, $logo);

        return [
            'images' => array_values(array_unique(array_map(fn ($u) => str_replace(' ', '%20', $u), $images[1]))),
            'logo_brand' => $logo[1] ?? null,
        ];
    }

    private function note(string $line): void
    {
        $this->report[] = $line;
        $this->warn($line);
    }

    /** @param list<array<string, mixed>> $added */
    private function reportMarkdown(array $added): string
    {
        $lines = ['# Ancien site : rapport d’import', '', 'Généré le '.now()->format('d/m/Y H:i').'.', '', '## Produits ajoutés ('.count($added).')', ''];
        $lines[] = '| Ancien id | Référence | Nom | Catégorie | Marque | Prix | Promo | Photos | À vérifier |';
        $lines[] = '|---|---|---|---|---|---|---|---|---|';
        foreach ($added as $p) {
            $lines[] = "| {$p['legacy_id']} | {$p['sku']} | {$p['name']} | {$p['category_slug']} | ".($p['brand_slug'] ?? '—')." | {$p['price']} | ".($p['promo_price'] ?? '—').' | '.count($p['images']).' | '.($p['verify_note'] ?? '').' |';
        }
        $lines[] = '';
        $lines[] = '## Remarques';
        $lines[] = '';
        foreach ($this->report as $line) {
            $lines[] = "- {$line}";
        }
        if (! $this->report) {
            $lines[] = '- Aucune.';
        }

        return implode("\n", $lines)."\n";
    }
}
