<?php

use App\Models\Lead;
use App\Models\Order;
use App\Models\User;
use App\Settings\GeneralSettings;
use App\Support\Sites\SiteSettings;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
| The public site is served by Next.js; Laravel only serves /api/v1, the Filament back office
| (/admin) and a few back-office extras below. A manager restricted to some sites (users.sites)
| gets a 404 on another site's order or request, as in the back office lists.
*/

Route::middleware(['web', 'auth'])->prefix('admin')->name('admin.')->group(function () {
    // Printable A4 order sheet (Commandes → Imprimer), with the order's site details.
    Route::get('commandes/{order}/imprimer', function (Order $order) {
        /** @var User|null $user */
        $user = auth()->user();
        abort_unless($user?->canAccessPanel(filament()->getPanel('admin')), 403);
        abort_unless($user->managesSite($order->site), 404);

        return view('admin.order-print', [
            'order' => $order->load('lines', 'user.resellerAccount'),
            'settings' => SiteSettings::for(GeneralSettings::class, $order->site),
        ]);
    })->name('orders.print');

    // Attachment of a request (plan, photo), stored on the private disk.
    Route::get('demandes/{lead}/piece-jointe', function (Lead $lead) {
        /** @var User|null $user */
        $user = auth()->user();
        abort_unless($user?->canAccessPanel(filament()->getPanel('admin')), 403);
        abort_unless($user->managesSite($lead->site), 404);
        abort_unless($lead->attachment_path && Storage::disk('local')->exists($lead->attachment_path), 404);

        return Storage::disk('local')->download($lead->attachment_path);
    })->name('leads.attachment');
});
