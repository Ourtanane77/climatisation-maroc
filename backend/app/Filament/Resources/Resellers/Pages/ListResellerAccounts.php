<?php

namespace App\Filament\Resources\Resellers\Pages;

use App\Enums\ResellerStatus;
use App\Filament\Resources\Resellers\ResellerAccountResource;
use App\Models\ResellerAccount;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListResellerAccounts extends ListRecords
{
    protected static string $resource = ResellerAccountResource::class;

    public function getTabs(): array
    {
        $tabs = [];
        foreach (ResellerStatus::cases() as $status) {
            $tabs[$status->value] = Tab::make($status->getLabel())
                ->badge(ResellerAccount::query()->where('status', $status)->count() ?: null)
                ->badgeColor($status->getColor())
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', $status));
        }

        return $tabs + ['tous' => Tab::make('Tous')];
    }
}
