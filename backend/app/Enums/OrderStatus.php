<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** Statut de commande, dans l'ordre du workflow. */
enum OrderStatus: string implements HasColor, HasLabel
{
    case Nouvelle = 'nouvelle';
    case Confirmee = 'confirmee';
    case Expediee = 'expediee';
    case Livree = 'livree';
    case Annulee = 'annulee';

    public function getLabel(): string
    {
        return match ($this) {
            self::Nouvelle => 'Nouvelle',
            self::Confirmee => 'Confirmée',
            self::Expediee => 'Expédiée',
            self::Livree => 'Livrée',
            self::Annulee => 'Annulée',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Nouvelle => 'info',
            self::Confirmee => 'primary',
            self::Expediee => 'warning',
            self::Livree => 'success',
            self::Annulee => 'danger',
        };
    }

    /**
     * Statuses reachable from this one (back-office workflow).
     *
     * @return list<self>
     */
    public function next(): array
    {
        return match ($this) {
            self::Nouvelle => [self::Confirmee, self::Annulee],
            self::Confirmee => [self::Expediee, self::Annulee],
            self::Expediee => [self::Livree, self::Annulee],
            self::Livree, self::Annulee => [],
        };
    }

    /** Label used on the public tracking page (design: Reçue, Confirmée, Expédiée, Livrée). */
    public function trackingLabel(): string
    {
        return $this === self::Nouvelle ? 'Reçue' : $this->getLabel();
    }
}
