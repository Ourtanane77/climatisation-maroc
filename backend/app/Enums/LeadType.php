<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Type de demande reçue par les formulaires. */
enum LeadType: string implements HasColor, HasLabel
{
    case Devis = 'devis';
    case Contact = 'contact';
    case Revendeur = 'revendeur';
    case Secteur = 'secteur';
    case AlerteStock = 'alerte_stock';

    public function getLabel(): string
    {
        return match ($this) {
            self::Devis => 'Devis',
            self::Contact => 'Contact',
            self::Revendeur => 'Revendeur',
            self::Secteur => 'Secteur',
            self::AlerteStock => 'Alerte stock',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Devis => 'primary',
            self::Contact => 'info',
            self::Revendeur => 'warning',
            self::Secteur => 'success',
            self::AlerteStock => 'gray',
        };
    }
}
