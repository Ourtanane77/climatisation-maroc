<?php

namespace App\Filament\Resources\FaqItems\Pages;

use App\Filament\Resources\FaqItems\FaqItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageFaqItems extends ManageRecords
{
    protected static string $resource = FaqItemResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
