<?php

namespace App\Filament\Resources\CityPages\Pages;

use App\Filament\Resources\CityPages\CityPageResource;
use App\Models\Contracts\HasPublicUrl;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCityPage extends EditRecord
{
    protected static string $resource = CityPageResource::class;

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
