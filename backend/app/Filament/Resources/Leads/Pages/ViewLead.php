<?php

namespace App\Filament\Resources\Leads\Pages;

use App\Enums\LeadStatus;
use App\Filament\Resources\Leads\LeadResource;
use App\Models\Lead;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Pages\ViewRecord;

/** @property Lead $record */
class ViewLead extends ViewRecord
{
    protected static string $resource = LeadResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('done')->label('Marquer traitée')->icon('heroicon-o-check')->color('success')
                ->visible(fn () => $this->record->status === LeadStatus::Nouveau)
                ->action(fn () => $this->record->update(['status' => LeadStatus::Traite])),
            Action::make('archive')->label('Archiver')->icon('heroicon-o-archive-box')->color('gray')
                ->visible(fn () => $this->record->status !== LeadStatus::Archive)
                ->action(fn () => $this->record->update(['status' => LeadStatus::Archive])),
            Action::make('note')->label('Note interne')->icon('heroicon-o-pencil-square')
                ->fillForm(fn () => ['internal_note' => $this->record->internal_note])
                ->schema([Textarea::make('internal_note')->label('Note interne')->rows(4)])
                ->action(fn (array $data) => $this->record->update(['internal_note' => $data['internal_note']])),
        ];
    }
}
