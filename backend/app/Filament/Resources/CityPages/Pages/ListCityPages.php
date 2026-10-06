<?php

namespace App\Filament\Resources\CityPages\Pages;

use App\Filament\Resources\CityPages\CityPageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCityPages extends ListRecords
{
    protected static string $resource = CityPageResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
