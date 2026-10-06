<?php

namespace App\Filament\Resources\Leads\Pages;

use App\Enums\LeadStatus;
use App\Enums\LeadType;
use App\Filament\Resources\Leads\LeadResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

/** Inbox by type; badges count the new (untreated) requests. Archived ones only show in "Archivées". */
class ListLeads extends ListRecords
{
    protected static string $resource = LeadResource::class;

    public function getTabs(): array
    {
        $new = LeadResource::newCounts();
        $tabs = ['toutes' => Tab::make('Toutes')
            ->badge(array_sum($new) ?: null)
            ->modifyQueryUsing(fn (Builder $query) => $query->where('status', '!=', LeadStatus::Archive))];

        foreach (LeadType::cases() as $type) {
            $tabs[$type->value] = Tab::make($type->getLabel())
                ->badge($new[$type->value] ?? null)
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', $type)->where('status', '!=', LeadStatus::Archive));
        }

        $tabs['archive'] = Tab::make('Archivées')->modifyQueryUsing(fn (Builder $query) => $query->where('status', LeadStatus::Archive));

        return $tabs;
    }
}
