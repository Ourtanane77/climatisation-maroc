<?php

namespace App\Filament\Resources\SectorPages\Pages;

use App\Filament\Resources\SectorPages\SectorPageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSectorPages extends ListRecords
{
    protected static string $resource = SectorPageResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
