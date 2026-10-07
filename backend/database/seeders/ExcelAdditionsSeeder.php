<?php

namespace Database\Seeders;

use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Frontend\Revalidator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * The client's Excel list (docs/Produits - Climatisationmaroc.xlsx), via data/excel-additions.json
 * (built by scripts/excel-additions.py). Client decisions of 2026-10-07:
 * - `prices`: the Excel is the price authority where it gives a price (single selling price, so
 *   any promotion is removed). Applied on every run, after CatalogSeeder.
 * - `families`: products the site lacked, published with temporary references (XLS-…) and flagged
 *   « à vérifier » until the team enters the real reference; without an Excel price they are shown
 *   « Prix sur demande » (price 0, not orderable). A family that already exists is left untouched,
 *   so the team's edits are never overwritten by a reseed.
 */
class ExcelAdditionsSeeder extends Seeder
{
    public function run(): void
    {
        $path = dirname((string) config('catalog.source')).'/excel-additions.json';
        if (! is_file($path)) {
            return;
        }
        /** @var array{prices: array<string, int|float>, verify: array<string, string>, families: list<array{name: string, slug?: string|null, category: string, brand: string|null, art: string|null, note: string, merge_into: string|null, variants: list<array{label: string|null, power_btu: int|null, price: int|null, sku: string}>}>} $data */
        $data = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        foreach ($data['prices'] as $sku => $dhs) {
            $updated = ProductVariant::query()->where('sku', $sku)->update(['price' => (int) round($dhs * 100), 'promo_price' => null]);
            if ($updated === 0) {
                // @phpstan-ignore nullsafe.neverNull (null when the seeder runs outside Artisan)
                $this->command?->warn("Fichier Excel : référence {$sku} introuvable, prix non appliqué.");
            }
        }

        foreach ($data['verify'] as $sku => $note) {
            ProductVariant::query()->where('sku', $sku)->update(['needs_verification' => true, 'verification_note' => $note]);
        }

        $created = 0;
        foreach ($data['families'] as $position => $family) {
            // New sizes/powers of a product the site already has: added to that product page.
            if ($family['merge_into']) {
                $this->mergeVariants($family);

                continue;
            }
            $slug = $family['slug'] ?? Str::slug($family['name']);
            if (Product::query()->where('slug', $slug)->exists()) {
                continue;
            }
            $product = Product::query()->create([
                'category_id' => Category::query()->where('path', $family['category'])->value('id')
                    ?? throw new RuntimeException("Catégorie absente : {$family['category']}"),
                'brand_id' => $family['brand'] ? Brand::query()->where('slug', $family['brand'])->value('id') : null,
                'name' => $family['name'],
                'slug' => $slug,
                'art_key' => $family['art'],
                'is_published' => true,
                'needs_verification' => true,
                'verification_note' => $family['note'],
                'position' => 2000 + $position,
            ]);
            foreach ($family['variants'] as $i => $v) {
                $product->variants()->create([
                    'sku' => $v['sku'],
                    'label' => $v['label'],
                    'power_btu' => $v['power_btu'],
                    'price' => ($v['price'] ?? 0) * 100,
                    'stock_status' => StockStatus::EnStock,
                    'position' => $i,
                    'is_default' => $i === 0,
                    'needs_verification' => true,
                    'verification_note' => $v['price'] === null ? 'Prix à saisir (affiché « Prix sur demande »).' : null,
                ]);
            }
            $created++;
        }
        // Bulk price updates skip model events: drop the API and front-office caches explicitly.
        Revalidator::changed();

        // @phpstan-ignore nullsafe.neverNull (null when the seeder runs outside Artisan)
        $this->command?->info('Fichier Excel : '.count($data['prices'])." prix appliqués, {$created} produit(s) ajouté(s).");
    }

    /**
     * @param  array{name: string, note: string, merge_into: string|null, variants: list<array{label: string|null, power_btu: int|null, price: int|null, sku: string}>}  $family
     */
    private function mergeVariants(array $family): void
    {
        $product = Product::query()->where('slug', $family['merge_into'])->first();
        if (! $product) {
            // @phpstan-ignore nullsafe.neverNull (null when the seeder runs outside Artisan)
            $this->command?->warn("Fichier Excel : produit {$family['merge_into']} introuvable.");

            return;
        }
        foreach ($family['variants'] as $v) {
            if (ProductVariant::query()->where('sku', $v['sku'])->exists()) {
                continue;
            }
            $product->variants()->create([
                'sku' => $v['sku'],
                'label' => $v['label'],
                'power_btu' => $v['power_btu'],
                'price' => ($v['price'] ?? 0) * 100,
                'stock_status' => StockStatus::EnStock,
                'is_default' => false,
                'needs_verification' => true,
                'verification_note' => $family['note'].($v['price'] === null ? ' Prix à saisir (affiché « Prix sur demande »).' : ''),
            ]);
        }
        // Keep the selector in order: power, then the number in the label (Ø 160, Ø 200, Ø 250).
        $product->variants()->get()
            ->sortBy(fn (ProductVariant $v) => [$v->power_btu ?? 0, (int) preg_replace('/\D/', '', (string) $v->label)])
            ->values()
            ->each(fn (ProductVariant $v, int $i) => $v->update(['position' => $i]));
    }
}
