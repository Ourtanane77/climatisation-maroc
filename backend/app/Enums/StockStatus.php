<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Disponibilité d'une variante. */
enum StockStatus: string implements HasColor, HasLabel
{
    case EnStock = 'en_stock';
    case Rupture = 'rupture';
    case SurCommande = 'sur_commande';

    public function getLabel(): string
    {
        return match ($this) {
            self::EnStock => 'En stock',
            self::Rupture => 'Rupture de stock',
            self::SurCommande => 'Sur commande',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::EnStock => 'success',
            self::Rupture => 'danger',
            self::SurCommande => 'warning',
        };
    }

    public function isOrderable(): bool
    {
        return $this !== self::Rupture;
    }
}
