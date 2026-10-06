<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class LatestOrders extends TableWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Dernières commandes';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->latest()->limit(8))
            ->paginated(false)
            ->columns([
                TextColumn::make('reference')->label('Référence')->weight('bold'),
                TextColumn::make('created_at')->label('Date')->since(),
                TextColumn::make('customer_name')->label('Client'),
                TextColumn::make('city_name')->label('Ville'),
                TextColumn::make('total')->label('Total')->formatStateUsing(fn ($state) => OrderResource::dhs($state))->alignEnd(),
                TextColumn::make('status')->label('Statut')->badge(),
            ])
            ->recordActions([
                ViewAction::make()->url(fn (Order $record) => OrderResource::getUrl('view', ['record' => $record])),
            ]);
    }
}
