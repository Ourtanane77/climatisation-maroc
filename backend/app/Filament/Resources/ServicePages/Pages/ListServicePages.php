<?php

namespace App\Filament\Resources\ServicePages\Pages;

use App\Filament\Resources\ServicePages\ServicePageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListServicePages extends ListRecords
{
    protected static string $resource = ServicePageResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
