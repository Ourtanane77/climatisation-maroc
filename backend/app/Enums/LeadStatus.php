<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Traitement d'une demande. */
enum LeadStatus: string implements HasColor, HasLabel
{
    case Nouveau = 'nouveau';
    case Traite = 'traite';
    case Archive = 'archive';

    public function getLabel(): string
    {
        return match ($this) {
            self::Nouveau => 'Nouveau',
            self::Traite => 'Traité',
            self::Archive => 'Archivé',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Nouveau => 'danger',
            self::Traite => 'success',
            self::Archive => 'gray',
        };
    }
}
