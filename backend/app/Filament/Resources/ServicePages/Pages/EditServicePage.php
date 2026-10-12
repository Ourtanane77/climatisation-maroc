<?php

namespace App\Filament\Resources\ServicePages\Pages;

use App\Filament\Forms\SiteFields;
use App\Filament\Resources\ServicePages\ServicePageResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditServicePage extends EditRecord
{
    protected static string $resource = ServicePageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ...SiteFields::viewActions(),
            DeleteAction::make(),
        ];
    }
}
