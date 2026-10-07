<?php

namespace App\Filament\Exports;

use App\Models\Product;
use App\Models\ProductVariant;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Number;

/** CSV export, one row per variant (same columns as the import, prices in Dhs). */
class ProductVariantExporter extends Exporter
{
    protected static ?string $model = ProductVariant::class;

    /**
     * The action sits on the products table, so it receives a query of products (with the table's
     * filters and selection): export the variants of those products.
     */
    public static function modifyQuery(Builder $query): Builder
    {
        if ($query->getModel() instanceof Product) {
            $products = $query->clone()->reorder()->select('products.id')->setEagerLoads([]);
            $query = ProductVariant::query()->whereIn('product_id', $products)->orderBy('product_id')->orderBy('position');
        }

        return $query->with(['product.category', 'product.brand']);
    }

    public static function getColumns(): array
    {
        $dhs = fn (?int $state) => $state === null ? null : number_format($state / 100, 2, '.', '');

        return [
            ExportColumn::make('sku')->label('Référence'),
            ExportColumn::make('product.name')->label('Famille'),
            ExportColumn::make('product.category.path')->label('Catégorie (chemin)'),
            ExportColumn::make('product.brand.name')->label('Marque'),
            ExportColumn::make('label')->label('Libellé'),
            ExportColumn::make('power_btu')->label('Puissance (BTU)'),
            ExportColumn::make('colour')->label('Couleur'),
            ExportColumn::make('price')->label('Prix (Dhs)')->formatStateUsing($dhs),
            ExportColumn::make('promo_price')->label('Prix promotion (Dhs)')->formatStateUsing($dhs),
            ExportColumn::make('pro_price')->label('Prix revendeur (Dhs)')->formatStateUsing($dhs),
            ExportColumn::make('stock_status')->label('Stock')->formatStateUsing(fn ($state) => $state?->value),
            ExportColumn::make('product.is_published')->label('Publié')->formatStateUsing(fn ($state) => $state ? 'oui' : 'non'),
            ExportColumn::make('needs_verification')->label('À vérifier')->formatStateUsing(fn ($state) => $state ? 'oui' : 'non'),
            ExportColumn::make('legacy_id')->label('ID ancien site'),
            // Empty, for the team to fill and re-import (renames the reference).
            ExportColumn::make('nouvelle_reference')->label('Nouvelle référence')->state(fn () => ''),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Export terminé : '.Number::format($export->successful_rows).' variante(s) exportée(s).';
    }
}
