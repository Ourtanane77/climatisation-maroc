<?php

namespace App\Filament\Resources\CityPages\Pages;

use App\Filament\Forms\SiteFields;
use App\Filament\Resources\CityPages\CityPageResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCityPage extends EditRecord
{
    protected static string $resource = CityPageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ...SiteFields::viewActions(),
            DeleteAction::make(),
        ];
    }
}
