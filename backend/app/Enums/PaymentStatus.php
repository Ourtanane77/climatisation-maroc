<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** État du paiement en ligne (commandes payées par carte seulement). */
enum PaymentStatus: string implements HasColor, HasLabel
{
    case EnAttente = 'en_attente';
    case Payee = 'payee';
    case Echouee = 'echouee';

    public function getLabel(): string
    {
        return match ($this) {
            self::EnAttente => 'Paiement en attente',
            self::Payee => 'Payée en ligne',
            self::Echouee => 'Paiement échoué',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::EnAttente => 'warning',
            self::Payee => 'success',
            self::Echouee => 'danger',
        };
    }
}
