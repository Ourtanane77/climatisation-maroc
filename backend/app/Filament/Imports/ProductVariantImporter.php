<?php

namespace App\Filament\Imports;

use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Support\Number;
use Illuminate\Support\Str;

/**
 * CSV import keyed on the reference (SKU): existing variants are updated (prices, stock…);
 * a new SKU creates a variant in the family named in "famille" (created if needed, in "categorie").
 * Prices are in Dhs in the file and stored in centimes.
 */
class ProductVariantImporter extends Importer
{
    protected static ?string $model = ProductVariant::class;

    public static function getColumns(): array
    {
        $money = fn ($state) => blank($state) ? null : (int) round(((float) str_replace([' ', ','], ['', '.'], (string) $state)) * 100);
        $none = fn () => null;

        return [
            ImportColumn::make('sku')->label('Référence')->requiredMapping()->rules(['required', 'max:64']),
            ImportColumn::make('famille')->label('Famille')->requiredMappingForNewRecordsOnly()->fillRecordUsing($none),
            ImportColumn::make('categorie')->label('Catégorie (chemin)')->example('climatisation/mural')->fillRecordUsing($none),
            ImportColumn::make('marque')->label('Marque')->fillRecordUsing($none),
            ImportColumn::make('label')->label('Libellé'),
            ImportColumn::make('power_btu')->label('Puissance (BTU)')->integer()->rules(['nullable', 'integer', 'min:0']),
            ImportColumn::make('colour')->label('Couleur'),
            ImportColumn::make('price')->label('Prix (Dhs)')->castStateUsing($money)->requiredMappingForNewRecordsOnly()->rules(['nullable', 'integer', 'min:0']),
            ImportColumn::make('promo_price')->label('Prix promotion (Dhs)')->castStateUsing($money)->rules(['nullable', 'integer', 'min:0']),
            ImportColumn::make('pro_price')->label('Prix revendeur (Dhs)')->castStateUsing($money)->rules(['nullable', 'integer', 'min:0']),
            ImportColumn::make('stock_status')->label('Stock')->example('en_stock')
                ->rules(['nullable', 'in:'.implode(',', array_column(StockStatus::cases(), 'value'))]),
            ImportColumn::make('needs_verification')->label('À vérifier')->boolean(),
        ];
    }

    public function resolveRecord(): ?ProductVariant
    {
        $variant = ProductVariant::query()->firstOrNew(['sku' => trim((string) $this->data['sku'])]);
        if ($variant->exists) {
            return $variant;
        }

        $category = Category::query()->where('path', trim((string) ($this->data['categorie'] ?? ''), '/'))->first();
        $name = trim((string) ($this->data['famille'] ?? ''));
        if (! $category || $name === '') {
            return null; // the row is reported as failed
        }

        $brand = filled($this->data['marque'] ?? null)
            ? Brand::query()->where('slug', Str::slug((string) $this->data['marque']))->orWhere('name', $this->data['marque'])->first()
            : null;

        $product = Product::query()->firstOrCreate(
            ['name' => $name, 'category_id' => $category->id],
            ['slug' => self::uniqueSlug($name), 'brand_id' => $brand?->id, 'is_published' => false],
        );

        $variant->product_id = $product->id;
        $variant->position = $product->variants()->count();

        return $variant;
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'Import terminé : '.Number::format($import->successful_rows).' ligne(s) importée(s).';
        if ($failed = $import->getFailedRowsCount()) {
            $body .= ' '.Number::format($failed).' ligne(s) en échec (référence nouvelle sans famille ou catégorie valide).';
        }

        return $body;
    }

    private static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        for ($i = 2; Product::query()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
