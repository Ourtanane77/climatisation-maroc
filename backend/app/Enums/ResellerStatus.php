<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Validation d'un compte revendeur. */
enum ResellerStatus: string implements HasColor, HasLabel
{
    case EnAttente = 'en_attente';
    case Valide = 'valide';
    case Refuse = 'refuse';

    public function getLabel(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Valide => 'Validé',
            self::Refuse => 'Refusé',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::EnAttente => 'warning',
            self::Valide => 'success',
            self::Refuse => 'danger',
        };
    }
}
