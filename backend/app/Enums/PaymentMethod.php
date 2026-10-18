<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Mode de paiement choisi à la commande. */
enum PaymentMethod: string implements HasColor, HasLabel
{
    /** Nothing to pay online: the shop calls the customer, who pays on delivery. */
    case Livraison = 'livraison';
    /** Online card payment through the CMI gateway. */
    case Carte = 'carte';

    public function getLabel(): string
    {
        return match ($this) {
            self::Livraison => 'À la livraison',
            self::Carte => 'Carte bancaire (en ligne)',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Livraison => 'gray',
            self::Carte => 'info',
        };
    }
}
