<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Forms\SiteFields;
use App\Filament\Resources\Products\ProductResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ...SiteFields::viewActions(),
            DeleteAction::make(),
        ];
    }
}
