<?php

namespace App\Support\Catalog;

use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Seeds products from data/catalog.json (the authority for references and prices).
 * Idempotent: variants are matched by SKU, families by slug; re-running updates them.
 * Images keep their old-site URL until `php artisan catalog:download-images`.
 */
class CatalogImporter
{
    /** @var array<string, int> */
    private array $categoryIds = [];

    /** @var array<string, int> */
    private array $brandIds = [];

    /** @param array<string, mixed> $config config('catalog') */
    public function __construct(private CatalogGrouper $grouper, private array $config) {}

    public static function make(): self
    {
        return new self(new CatalogGrouper(config('catalog')), config('catalog'));
    }

    /** @return array<string, mixed> decoded catalog.json */
    public function load(?string $path = null): array
    {
        $path ??= $this->config['source'];
        if (! is_file($path)) {
            throw new RuntimeException("Catalogue introuvable : {$path}");
        }

        return json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * @param  array<string, mixed>  $catalog
     * @return array{families: int, variants: int}
     */
    public function import(array $catalog): array
    {
        $this->categoryIds = Category::query()->pluck('id', 'path')->all();
        $this->brandIds = Brand::query()->pluck('id', 'slug')->all();

        $families = $this->grouper->group($catalog['products']);
        $variantCount = 0;

        DB::transaction(function () use ($families, &$variantCount) {
            foreach ($families as $position => $family) {
                $variantCount += $this->importFamily($family, $position);
            }
        });

        return ['families' => count($families), 'variants' => $variantCount];
    }

    /** @param array{name: string, brand: string|null, category_path: string, rows: list<array<string, mixed>>, labels: list<string|null>, colours: list<string|null>} $family */
    private function importFamily(array $family, int $position): int
    {
        $rows = $family['rows'];
        $first = $rows[0];
        $categoryId = $this->categoryIds[$family['category_path']]
            ?? throw new RuntimeException("Catégorie absente : {$family['category_path']} ({$family['name']})");

        $existing = ProductVariant::query()->whereIn('sku', array_column($rows, 'sku'))->value('product_id');
        $product = $existing ? Product::query()->findOrFail($existing) : new Product;

        $product->fill([
            'category_id' => $categoryId,
            'brand_id' => $family['brand'] ? ($this->brandIds[$family['brand']] ?? null) : null,
            'name' => $family['name'],
            'slug' => $product->slug ?: $this->uniqueSlug($family['name']),
            'short_description' => $this->familyDescription($rows),
            'description' => $first['description'] ?: null,
            'technology' => $this->technology($family['name']),
            'refrigerant' => $this->refrigerant($family['name']),
            'art_key' => $product->art_key ?? $this->artKey($family['category_path']),
            'is_new' => collect($rows)->contains('is_new', true),
            'is_featured' => collect($rows)->contains('is_featured', true),
            'is_published' => collect($rows)->contains('is_active', true),
            'position' => $product->exists ? $product->position : $position,
        ])->save();

        $sharedSpecs = $this->sharedSpecs($rows);
        $product->specs()->delete();
        foreach ($sharedSpecs as $i => [$label, $value]) {
            $product->specs()->create(['label' => $label, 'value' => $value, 'position' => $i]);
        }

        foreach ($rows as $i => $row) {
            $verifyNote = $this->config['verify'][$row['sku']] ?? null;
            $variant = ProductVariant::query()->updateOrCreate(['sku' => $row['sku']], [
                'product_id' => $product->id,
                'label' => $family['labels'][$i],
                'power_btu' => $row['btu'],
                'colour' => $family['colours'][$i],
                'price' => $this->centimes($row['price']),
                'promo_price' => $row['promo_price'] !== null ? $this->centimes($row['promo_price']) : null,
                'stock_status' => $row['stock_status'] === 'en_stock' ? StockStatus::EnStock : StockStatus::Rupture,
                'position' => $i,
                'is_default' => $i === 0,
                'needs_verification' => $verifyNote !== null,
                'verification_note' => $verifyNote,
                'legacy_id' => $row['legacy_id'],
            ]);

            $variant->specs()->delete();
            foreach ($row['specs'] as $j => $spec) {
                if (! in_array([$spec['label'], $spec['value']], $sharedSpecs, true)) {
                    $variant->specs()->create(['product_id' => $product->id, 'label' => $spec['label'], 'value' => $spec['value'], 'position' => $j]);
                }
            }

            foreach ($row['images'] as $k => $url) {
                $product->images()->firstOrCreate(
                    ['source_url' => $url],
                    ['product_variant_id' => $variant->id, 'alt' => $row['name'], 'position' => $i * 10 + $k],
                );
            }
        }

        return count($rows);
    }

    /**
     * Spec rows identical across all variants belong to the family.
     *
     * @param  list<array<string, mixed>>  $rows
     * @return list<array{0: string, 1: string}>
     */
    private function sharedSpecs(array $rows): array
    {
        $sets = array_map(fn ($r) => array_map(fn ($s) => [$s['label'], $s['value']], $r['specs']), $rows);
        $shared = array_shift($sets) ?? [];
        foreach ($sets as $set) {
            $shared = array_values(array_filter($shared, fn ($pair) => in_array($pair, $set, true)));
        }

        return $shared;
    }

    /**
     * The first row's short description without its power ("…, 9 000 BTU/h, …").
     *
     * @param  list<array<string, mixed>>  $rows
     */
    private function familyDescription(array $rows): ?string
    {
        $text = $rows[0]['short_description'] ?? null;
        if (! $text || count($rows) === 1) {
            return $text ?: null;
        }

        return trim((string) preg_replace('/,?\s*\d{1,2}\s?000 BTU\/h/u', '', $text));
    }

    private function technology(string $name): ?string
    {
        return match (true) {
            (bool) preg_match('/inverter/i', $name) => 'Inverter',
            (bool) preg_match('/on\/off|normal/i', $name) => 'On/Off',
            default => null,
        };
    }

    private function refrigerant(string $name): ?string
    {
        return match (true) {
            (bool) preg_match('/\bR32\b/i', $name) => 'R32',
            (bool) preg_match('/\b(R?410A?)\b/i', $name) => 'R410A',
            default => null,
        };
    }

    private function artKey(string $categoryPath): ?string
    {
        return match (true) {
            str_starts_with($categoryPath, 'climatisation/gainable') => 'gainable',
            str_starts_with($categoryPath, 'climatisation/cassette') => 'cassette',
            str_starts_with($categoryPath, 'climatisation/console') => 'console',
            str_starts_with($categoryPath, 'climatisation') => 'mural',
            str_starts_with($categoryPath, 'chauffe-eau') => 'solaire',
            str_starts_with($categoryPath, 'ventilation') => 'vent',
            str_starts_with($categoryPath, 'gaines') => 'flex',
            str_starts_with($categoryPath, 'pieces-de-rechange/telecommandes') => 'remote',
            str_starts_with($categoryPath, 'pieces-de-rechange/supports') => 'support',
            str_starts_with($categoryPath, 'pieces-de-rechange/adhesifs') => 'scotch',
            default => null,
        };
    }

    private function centimes(int|float $dhs): int
    {
        return (int) round($dhs * 100);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while (Product::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
