<?php

namespace App\Filament\Resources\Products\Tables;

use App\Filament\Exports\ProductVariantExporter;
use App\Filament\Forms\Fields;
use App\Filament\Imports\ProductVariantImporter;
use App\Models\Product;
use App\Models\ProductVariant;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['category', 'brand', 'variants', 'images'])->withCount('variants'))
            ->defaultSort('position')
            ->columns([
                ImageColumn::make('thumb')
                    ->label('')
                    ->state(fn (Product $record) => $record->images->first()?->path)
                    ->disk('public')
                    ->imageHeight(40),
                TextColumn::make('name')->label('Famille')->searchable()->sortable()->weight('bold')
                    ->description(function (Product $record) {
                        $skus = $record->variants->pluck('sku');

                        return $skus->take(3)->implode(' · ').($skus->count() > 3 ? ' · +'.($skus->count() - 3) : '');
                    }),
                TextColumn::make('variants.sku')->label('Référence')->searchable()->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('category.name')->label('Catégorie')->sortable(),
                TextColumn::make('brand.name')->label('Marque')->sortable()->toggleable(),
                TextColumn::make('variants_count')->label('Variantes')->alignCenter(),
                TextColumn::make('from_price')->label('À partir de')
                    ->state(fn (Product $record) => $record->fromPrice())
                    ->formatStateUsing(fn (?int $state) => $state === null ? '—' : number_format($state / 100, 2, ',', ' ').' Dhs'),
                IconColumn::make('on_promo')->label('Promo')->boolean()->state(fn (Product $record) => $record->isOnPromotion()),
                IconColumn::make('is_published')->label('Publié')->boolean(),
                IconColumn::make('flagged')->label('À vérifier')
                    ->state(fn (Product $record) => $record->needs_verification || $record->variants->contains('needs_verification', true))
                    ->icon(fn (bool $state) => $state ? 'heroicon-o-exclamation-triangle' : null)
                    ->color('warning')
                    ->tooltip(fn (Product $record) => $record->verification_note ?? $record->variants->firstWhere('needs_verification', true)?->verification_note),
            ])
            ->filters([
                Filter::make('a_verifier')
                    ->label('À vérifier')
                    ->toggle()
                    ->query(fn (Builder $query) => $query->whereIn('products.id', Product::query()->needsVerification()->select('id'))),
                SelectFilter::make('category_id')->label('Catégorie')->options(Fields::categoryOptions())->searchable(),
                SelectFilter::make('brand_id')->label('Marque')->relationship('brand', 'name')->preload(),
                TernaryFilter::make('is_published')->label('Publié'),
                Filter::make('promo')
                    ->label('En promotion')
                    ->toggle()
                    ->query(fn (Builder $query) => $query->whereHas('variants', fn (Builder $v) => $v->whereNotNull('promo_price')->whereColumn('promo_price', '<', 'price'))),
            ])
            ->headerActions([
                ImportAction::make()->label('Importer (CSV)')->importer(ProductVariantImporter::class),
                ExportAction::make()->label('Exporter (CSV)')->exporter(ProductVariantExporter::class),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('publish')->label('Publier')->icon('heroicon-o-eye')
                        ->action(fn (Collection $records) => Product::query()->whereKey($records->modelKeys())->update(['is_published' => true]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('unpublish')->label('Dépublier')->icon('heroicon-o-eye-slash')
                        ->action(fn (Collection $records) => Product::query()->whereKey($records->modelKeys())->update(['is_published' => false]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('promo')->label('Appliquer une remise (%)')->icon('heroicon-o-receipt-percent')
                        ->schema([TextInput::make('percent')->label('Remise en %')->helperText('0 pour retirer la promotion.')->numeric()->minValue(0)->maxValue(90)->required()])
                        ->action(function (Collection $records, array $data) {
                            $percent = (float) $data['percent'];
                            ProductVariant::query()->whereIn('product_id', $records->modelKeys())->each(function (ProductVariant $v) use ($percent) {
                                $v->update(['promo_price' => $percent > 0 ? (int) (round($v->price * (100 - $percent) / 10000) * 100) : null]);
                            });
                            Notification::make()->title('Remise appliquée')->success()->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('move')->label('Changer de catégorie')->icon('heroicon-o-folder')
                        ->schema([Select::make('category_id')->label('Nouvelle catégorie')->options(Fields::categoryOptions())->required()])
                        ->action(fn (Collection $records, array $data) => Product::query()->whereKey($records->modelKeys())->update(['category_id' => $data['category_id']]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('verified')->label('Marquer comme vérifié')->icon('heroicon-o-check-badge')
                        ->action(function (Collection $records) {
                            Product::query()->whereKey($records->modelKeys())->update(['needs_verification' => false]);
                            ProductVariant::query()->whereIn('product_id', $records->modelKeys())->update(['needs_verification' => false]);
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
