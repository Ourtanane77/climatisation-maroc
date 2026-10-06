<?php

namespace App\Filament\Resources\Pages\Pages;

use App\Filament\Resources\Pages\PageResource;
use App\Models\Contracts\HasPublicUrl;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPage extends EditRecord
{
    protected static string $resource = PageResource::class;

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
