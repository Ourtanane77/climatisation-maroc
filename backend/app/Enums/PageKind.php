<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Nature d'une page statique. */
enum PageKind: string implements HasColor, HasLabel
{
    case Legal = 'legal';
    case About = 'about';
    case Delivery = 'delivery';
    case Other = 'other';

    public function getLabel(): string
    {
        return match ($this) {
            self::Legal => 'Page légale',
            self::About => 'À propos',
            self::Delivery => 'Livraison et paiement',
            self::Other => 'Autre',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Legal => 'gray',
            self::About => 'info',
            self::Delivery => 'info',
            self::Other => 'gray',
        };
    }
}
