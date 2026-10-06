<?php

namespace App\Filament\Resources\Orders;

use App\Enums\OrderStatus;
use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Filament\Resources\Orders\Pages\ViewOrder;
use App\Models\Order;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingBag;

    protected static string|UnitEnum|null $navigationGroup = 'Ventes';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'commande';

    protected static ?string $pluralModelLabel = 'commandes';

    protected static ?string $recordTitleAttribute = 'reference';

    /** Orders are created by customers on the site only. */
    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $count = Order::query()->where('status', OrderStatus::Nouvelle)->count();

        return $count ? (string) $count : null;
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Nouvelles commandes';
    }

    /** @return list<string> */
    public static function getGloballySearchableAttributes(): array
    {
        return ['reference', 'customer_name', 'phone'];
    }

    public static function dhs(?int $centimes): string
    {
        return $centimes === null ? '—' : number_format($centimes / 100, 2, ',', ' ').' Dhs';
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(3)->columnSpanFull()->schema([
                Section::make('Commande')->columnSpan(1)->schema([
                    TextEntry::make('reference')->label('Référence')->weight('bold')->copyable(),
                    TextEntry::make('status')->label('Statut')->badge(),
                    TextEntry::make('created_at')->label('Passée le')->dateTime('d/m/Y à H:i'),
                    TextEntry::make('pricing')->label('Tarif')->formatStateUsing(fn (string $state) => $state === 'pro' ? 'Revendeur' : 'Public'),
                ]),
                Section::make('Client')->columnSpan(1)->schema([
                    TextEntry::make('customer_name')->label('Nom'),
                    TextEntry::make('phone')->label('Téléphone')->url(fn (Order $record) => 'tel:'.$record->phone),
                    TextEntry::make('email')->label('E-mail')->placeholder('—'),
                    TextEntry::make('user.resellerAccount.company')->label('Revendeur')->placeholder('—'),
                ]),
                Section::make('Livraison')->columnSpan(1)->schema([
                    TextEntry::make('address')->label('Adresse'),
                    TextEntry::make('city_name')->label('Ville'),
                    TextEntry::make('note')->label('Note pour le livreur')->placeholder('—'),
                ]),
            ]),
            Section::make('Articles')->columnSpanFull()->schema([
                RepeatableEntry::make('lines')->hiddenLabel()->columns(5)->schema([
                    TextEntry::make('name')->label('Produit')->columnSpan(2)
                        ->formatStateUsing(fn ($state, $record) => trim($state.' '.($record->variant_label ?? ''))),
                    TextEntry::make('sku')->label('Référence'),
                    TextEntry::make('qty')->label('Qté')->formatStateUsing(fn ($state, $record) => $state.' × '.static::dhs($record->unit_price)),
                    TextEntry::make('line_total')->label('Total')->formatStateUsing(fn ($state) => static::dhs($state))->weight('bold'),
                ]),
                Grid::make(4)->schema([
                    TextEntry::make('subtotal')->label('Sous-total')->formatStateUsing(fn ($state) => static::dhs($state)),
                    TextEntry::make('technical_visit_price')->label('Visite technique')
                        ->formatStateUsing(fn ($state, Order $record) => $record->option_technical_visit ? static::dhs($state) : 'Non'),
                    TextEntry::make('option_installation_quote')->label('Devis de pose')->formatStateUsing(fn ($state) => $state ? 'Demandé' : 'Non'),
                    TextEntry::make('total')->label('Total')->formatStateUsing(fn ($state) => static::dhs($state))->weight('bold')->size('lg'),
                ]),
            ]),
            Grid::make(2)->columnSpanFull()->schema([
                Section::make('Historique')->schema([
                    RepeatableEntry::make('history')->hiddenLabel()->columns(3)->schema([
                        TextEntry::make('status')->label('Statut')->badge(),
                        TextEntry::make('created_at')->label('Date')->dateTime('d/m/Y H:i'),
                        TextEntry::make('user.name')->label('Par')->placeholder('Client'),
                    ]),
                ]),
                Section::make('Note interne')->schema([
                    TextEntry::make('internal_note')->hiddenLabel()->placeholder('Aucune note.'),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('reference')->label('Référence')->searchable()->weight('bold'),
                TextColumn::make('created_at')->label('Date')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('customer_name')->label('Client')->searchable(),
                TextColumn::make('phone')->label('Téléphone')->searchable(),
                TextColumn::make('city_name')->label('Ville')->sortable(),
                TextColumn::make('total')->label('Total')->formatStateUsing(fn ($state) => static::dhs($state))->sortable()->alignEnd(),
                IconColumn::make('option_technical_visit')->label('Visite')->boolean()->toggleable(),
                TextColumn::make('status')->label('Statut')->badge()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->label('Statut')->options(OrderStatus::class)->multiple(),
                Filter::make('dates')->schema([
                    DatePicker::make('from')->label('Du'),
                    DatePicker::make('until')->label('Au'),
                ])->query(fn (Builder $query, array $data) => $query
                    ->when($data['from'] ?? null, fn (Builder $q, $d) => $q->whereDate('created_at', '>=', $d))
                    ->when($data['until'] ?? null, fn (Builder $q, $d) => $q->whereDate('created_at', '<=', $d))),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('print')->label('Imprimer')->icon('heroicon-o-printer')
                    ->url(fn (Order $record) => route('admin.orders.print', $record))->openUrlInNewTab(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOrders::route('/'),
            'view' => ViewOrder::route('/{record}'),
        ];
    }
}
