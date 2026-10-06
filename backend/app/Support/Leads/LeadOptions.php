<?php

namespace App\Support\Leads;

/** Choice lists of the design forms (Demander un devis, Contact, sector quote form). */
class LeadOptions
{
    public const PROJECT_TYPES = ['Nouvelle installation', 'Remplacement', 'Entretien', 'Fourniture seule'];

    public const SPACE_TYPES = ['Maison', 'Appartement', 'Bureau', 'Commerce', 'Restaurant', 'Hôtel', 'Autre'];

    public const CONTACT_SUBJECTS = ['Question sur un produit', 'Suivi de commande', 'Facturation', 'Service après-vente', 'Autre'];

    public const CUSTOMER_KINDS = ['particulier', 'professionnel'];
}
