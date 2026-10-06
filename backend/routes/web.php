<?php

use App\Models\Lead;
use App\Models\Order;
use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
| The public site is served by Next.js; Laravel only serves /api/v1, the Filament back office
| (/admin) and a few back-office extras below.
*/

Route::middleware(['web', 'auth'])->prefix('admin')->name('admin.')->group(function () {
    // Printable A4 order sheet (Commandes → Imprimer).
    Route::get('commandes/{order}/imprimer', function (Order $order, GeneralSettings $settings) {
        abort_unless(auth()->user()?->canAccessPanel(filament()->getPanel('admin')), 403);

        return view('admin.order-print', ['order' => $order->load('lines', 'user.resellerAccount'), 'settings' => $settings]);
    })->name('orders.print');

    // Attachment of a request (plan, photo), stored on the private disk.
    Route::get('demandes/{lead}/piece-jointe', function (Lead $lead) {
        abort_unless(auth()->user()?->canAccessPanel(filament()->getPanel('admin')), 403);
        abort_unless($lead->attachment_path && Storage::disk('local')->exists($lead->attachment_path), 404);

        return Storage::disk('local')->download($lead->attachment_path);
    })->name('leads.attachment');
});
