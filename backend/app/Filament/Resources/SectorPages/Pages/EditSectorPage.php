<?php

namespace App\Filament\Resources\SectorPages\Pages;

use App\Filament\Resources\SectorPages\SectorPageResource;
use App\Models\Contracts\HasPublicUrl;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSectorPage extends EditRecord
{
    protected static string $resource = SectorPageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view')
                ->label('Voir sur le site')
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->url(fn () => $this->getRecord() instanceof HasPublicUrl ? rtrim((string) config('shop.frontend_url'), '/').$this->getRecord()->url() : null)
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
