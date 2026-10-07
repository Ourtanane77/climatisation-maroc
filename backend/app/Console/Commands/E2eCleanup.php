<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Deletes what the Playwright end-to-end suite created in the dev database: orders and leads whose
 * name starts with the e2e marker ("E2E Test"). Order lines and status history cascade.
 * Refuses to run in production.
 */
#[Signature('app:e2e-cleanup {--marker=E2E Test : Name prefix used by the e2e suite}')]
#[Description('Supprime les commandes et demandes créées par les tests de bout en bout')]
class E2eCleanup extends Command
{
    public function handle(): int
    {
        if (app()->isProduction()) {
            $this->error('Refusé en production.');

            return self::FAILURE;
        }

        $marker = trim((string) $this->option('marker'));
        if (mb_strlen($marker) < 5) {
            $this->error('Marqueur trop court.');

            return self::FAILURE;
        }

        $orders = Order::query()->where('customer_name', 'like', addcslashes($marker, '%_').'%')->get();
        $orders->each->delete();
        $leads = Lead::query()->where('name', 'like', addcslashes($marker, '%_').'%')->delete();

        $this->info("{$orders->count()} commande(s) et {$leads} demande(s) supprimée(s).");

        return self::SUCCESS;
    }
}
