<?php

namespace App\Filament\Resources\Articles\Pages;

use App\Filament\Forms\SiteFields;
use App\Filament\Resources\Articles\ArticleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditArticle extends EditRecord
{
    protected static string $resource = ArticleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ...SiteFields::viewActions(),
            DeleteAction::make(),
        ];
    }
}
