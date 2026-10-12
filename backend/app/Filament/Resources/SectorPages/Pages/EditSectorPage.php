<?php

namespace App\Filament\Resources\SectorPages\Pages;

use App\Filament\Forms\SiteFields;
use App\Filament\Resources\SectorPages\SectorPageResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSectorPage extends EditRecord
{
    protected static string $resource = SectorPageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ...SiteFields::viewActions(),
            DeleteAction::make(),
        ];
    }
}
