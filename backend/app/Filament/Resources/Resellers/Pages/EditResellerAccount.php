<?php

namespace App\Filament\Resources\Resellers\Pages;

use App\Filament\Resources\Resellers\ResellerAccountResource;
use Filament\Resources\Pages\EditRecord;

class EditResellerAccount extends EditRecord
{
    protected static string $resource = ResellerAccountResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ResellerAccountResource::validateAction()->after(fn () => $this->refreshFormData(['status', 'decided_at'])),
            ResellerAccountResource::refuseAction()->after(fn () => $this->refreshFormData(['status', 'decided_at', 'refusal_reason'])),
        ];
    }
}
