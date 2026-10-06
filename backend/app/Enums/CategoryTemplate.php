<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Gabarit d'affichage d'une catégorie (voir design/). */
enum CategoryTemplate: string implements HasColor, HasLabel
{
    case Landing = 'landing';
    case Listing = 'listing';
    case Dense = 'dense';

    public function getLabel(): string
    {
        return match ($this) {
            self::Landing => 'Page gamme',
            self::Listing => 'Liste avec filtres',
            self::Dense => 'Liste rapide',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Landing => 'primary',
            self::Listing => 'info',
            self::Dense => 'gray',
        };
    }
}
