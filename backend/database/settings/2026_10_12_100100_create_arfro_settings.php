<?php

use Illuminate\Support\Facades\DB;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * arfro.com starts with a copy of Climatisation Maroc's settings (phones, stores, home page…); the
 * owner then edits them in the back office with the site switch on « Arfro ». Home product lists
 * filled later by the seeders are copied by HomeSeeder.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        foreach (['general' => 'general_arfro', 'home' => 'home_arfro'] as $from => $to) {
            foreach (DB::table('settings')->where('group', $from)->get() as $row) {
                $this->migrator->add("{$to}.{$row->name}", json_decode((string) $row->payload, true));
            }
        }
    }
};
