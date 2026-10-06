<?php

namespace Database\Seeders;

use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Catalog\CatalogImporter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Products: data/catalog.json (authority for references and prices), then the products that
 * only exist in the design files, flagged "à vérifier", then the LG Dual Inverter product page
 * content drawn in design/Produit LG Dual Inverter.dc.html.
 */
class CatalogSeeder extends Seeder
{
    private const DESIGN_NOTE = 'Produit repris du design (absent du catalogue de l’ancien site) : référence et prix à vérifier.';

    public function run(): void
    {
        $importer = CatalogImporter::make();
        $result = $importer->import($importer->load());
        // @phpstan-ignore nullsafe.neverNull (null when the seeder runs outside Artisan)
        $this->command?->info("Catalogue : {$result['families']} familles, {$result['variants']} variantes.");

        $this->designOnlyProducts();
        $this->lgDualInverter();
    }

    /** Products shown in the design but absent from catalog.json (decision of 2026-10-06). */
    private function designOnlyProducts(): void
    {
        // [category path, brand slug, family name, art key, [[label, sku, price Dhs, stock, power], …]]
        $products = [
            ['climatisation/cassette', 'lg', 'LG Cassette Inverter', 'cassette', [['18 000 BTU', 'ATNW18GPLS1', 12500, 'en_stock', 18000]]],
            ['cuivre-et-gaz/cuivre', 'lafarga', 'Cuivre 1/4 Lafarga 15 m', 'coilS', [[null, 'CUIV0005', 495, 'en_stock', null]]],
            ['cuivre-et-gaz/cuivre', 'lafarga', 'Cuivre 3/8 Lafarga 15 m', 'coilL', [[null, 'CUIV0006', 750, 'en_stock', null]]],
            ['cuivre-et-gaz/cuivre', null, 'Cuivre 1/2 15 m', 'coilL', [[null, 'CUIV0007', 1050, 'en_stock', null]]],
            ['cuivre-et-gaz/cuivre', 'lafarga', 'Cuivre 5/8 Lafarga 15 m', 'coilL', [[null, 'CUIV0008', 1350, 'en_stock', null]]],
            ['cuivre-et-gaz/cuivre', null, 'Cuivre 3/4 15 m', 'coilL', [[null, 'CUIV0009', 1875, 'rupture', null]]],
            ['cuivre-et-gaz/kits-duo', null, 'Kit duo 1/4-3/8 20 m', 'duo', [[null, 'CUIV0018', 1130, 'en_stock', null]]],
            ['cuivre-et-gaz/kits-duo', null, 'Kit duo 1/4-1/2 20 m', 'duo', [[null, 'CUIV0017', 1280, 'en_stock', null]]],
            ['cuivre-et-gaz/kits-duo', null, 'Kit duo 5/8-3/8 20 m', 'duo', [[null, 'CUIV0048', 2100, 'en_stock', null]]],
            ['cuivre-et-gaz/isolant', null, 'Armaflex 9/6', 'iso', [[null, 'CLIM00008', 3.5, 'en_stock', null]]],
            ['cuivre-et-gaz/isolant', null, 'Armaflex 9/12', 'iso', [[null, 'CLIM00004', 4.5, 'en_stock', null]]],
            ['cuivre-et-gaz/gaz-frigorifique', 'gs', 'Gaz R410 GS 11,3 kg', 'gaz', [[null, 'GAZ00042', 5000, 'en_stock', null]]],
            ['cuivre-et-gaz/gaz-frigorifique', 'gs', 'Gaz R407 GS 11,3 kg', 'gaz', [[null, 'GAZ00045', 3800, 'en_stock', null]]],
            ['cuivre-et-gaz/gaz-frigorifique', null, 'Gaz R22 13,6 kg', 'gaz', [[null, 'GAZ00044', 3750, 'en_stock', null]]],
        ];

        foreach ($products as $position => [$path, $brand, $name, $art, $variants]) {
            $product = Product::query()->updateOrCreate(['slug' => Str::slug($name)], [
                'category_id' => Category::query()->where('path', $path)->value('id'),
                'brand_id' => $brand ? Brand::query()->where('slug', $brand)->value('id') : null,
                'name' => $name,
                'art_key' => $art,
                'technology' => str_contains($name, 'Inverter') ? 'Inverter' : null,
                'is_published' => true,
                'needs_verification' => true,
                'verification_note' => self::DESIGN_NOTE,
                'position' => 1000 + $position,
            ]);

            // Each design-only product has a single variant.
            [[$label, $sku, $price, $stock, $power]] = $variants;
            ProductVariant::query()->updateOrCreate(['sku' => $sku], [
                'product_id' => $product->id,
                'label' => $label ? str_replace(' 000', "\u{00A0}000", $label) : null,
                'power_btu' => $power,
                'price' => (int) round($price * 100),
                'promo_price' => null,
                'stock_status' => StockStatus::from($stock),
                'position' => 0,
                'is_default' => true,
            ]);
        }
    }

    /** Product page content from design/Produit LG Dual Inverter.dc.html. */
    private function lgDualInverter(): void
    {
        $product = Product::query()->where('slug', 'lg-dual-inverter')->first();
        if (! $product) {
            return;
        }

        $product->update([
            'description' => 'Le LG Dual Inverter adapte en continu la vitesse de son compresseur : la pièce refroidit vite, puis la température reste stable avec une consommation réduite, jusqu\'à 70 % d\'électricité en moins. Il est classé tropical T3 pour les fortes chaleurs, reste silencieux et se pilote depuis le téléphone avec LG ThinQ.',
            'highlights' => [
                ['title' => 'Refroidissement rapide', 'icon' => 'snow'],
                ['title' => 'Jusqu’à 70 % d’économie d’énergie', 'icon' => 'tag'],
                ['title' => 'Silencieux', 'icon' => 'fan'],
                ['title' => 'Tropical T3', 'icon' => 'unit'],
                ['title' => 'Wi-Fi LG ThinQ', 'icon' => 'list'],
            ],
            'wifi' => 'Wi-Fi LG ThinQ',
        ]);

        // Spec rows of the design table that the catalogue does not carry.
        $extra = [['Gamme', 'Dual Inverter'], ['Classe climatique', 'Tropical T3'], ['Connectivité', 'Wi-Fi LG ThinQ']];
        $offset = $product->specs()->count();
        foreach ($extra as $i => [$label, $value]) {
            $product->specs()->updateOrCreate(['label' => $label], ['value' => $value, 'position' => $offset + $i]);
        }

        $faq = [
            ['Quelle puissance choisir ?', 'Environ 600 BTU par m² : 9 000 BTU jusqu’à 15 m², 12 000 jusqu’à 20 m², 18 000 jusqu’à 30 m², 24 000 jusqu’à 40 m².'],
            ['Le kit d’installation est-il inclus ?', 'Non. Ajoutez le kit duo 1/4-3/8 et le support GT dans « Pour l’installation ».'],
            ['Comment payer ?', 'Vous payez à la livraison. La livraison est gratuite partout au Maroc.'],
        ];
        foreach ($faq as $i => [$question, $answer]) {
            $product->faqItems()->updateOrCreate(['question' => $question], ['answer' => $answer, 'position' => $i]);
        }

        // "Pour l'installation": kit duo 1/4-3/8 and support GT, as drawn.
        $accessories = ProductVariant::query()->whereIn('sku', ['CUIV0018', 'CLIM00076'])->pluck('product_id', 'sku');
        $product->accessories()->sync([
            $accessories['CUIV0018'] => ['position' => 0],
            $accessories['CLIM00076'] => ['position' => 1],
        ]);

        $product->seo()->updateOrCreate([], ['title' => 'LG Dual Inverter · Climatiseur mural']);
    }
}
