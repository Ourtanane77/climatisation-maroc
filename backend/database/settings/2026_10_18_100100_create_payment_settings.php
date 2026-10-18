<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Online card payment (CMI), off on both sites until the store key is entered in the back office.
 * Climatisation Maroc's merchant id comes from CMI's production kit (ARIHA FROID,
 * climatisationmaroc.com); Arfro needs its own CMI registration.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        foreach (['payment' => '600005142', 'payment_arfro' => ''] as $group => $clientId) {
            $this->migrator->add("{$group}.cmi_enabled", false);
            $this->migrator->add("{$group}.cmi_mode", 'production');
            $this->migrator->add("{$group}.cmi_client_id", $clientId);
            $this->migrator->addEncrypted("{$group}.cmi_store_key", null);
        }
    }
};
